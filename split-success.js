import wixLocation from 'wix-location';
import { handleSessionCompletion } from "backend/stripeWorking.jsw"
import { local } from 'wix-storage-frontend';
import wixData from 'wix-data';

import { sendEmailToContact } from 'backend/sendEmail.web';

$w.onReady(function () {

    $w('#text1').text = "Loading..."
    $w('#text2').text = ""
    $w('#text1').show()
    $w('#text2').show()
    $w('#text3').hide()

    $w('#button1').hide()
    $w('#button2').hide()

    // Use the query property to get the query parameters object
    const queryParams = wixLocation.query;

    // Extract the session_id parameter
    const sessionId = queryParams.session_id;

    if (sessionId) {
        updateAndReturnCustomer(sessionId)
    }

    // If needed, you can then call a backend function to verify the session ID with Stripe
});

async function updateAndReturnCustomer(sessionId) {
    try {
        const result = await handleSessionCompletion(sessionId);
        if (result) {
            if (result.customer_id) {
                console.log("Payment method set as default successfully.");
                console.log("stripe_customer_id")
                console.log(result.customer_id)

                arrageData(result.customer_id)
            }

        } else {
            console.error("Failed to set payment method as default.");
        }
    } catch (error) {
        console.error("An error occurred while setting payment method as default:", error);
        // Handle any errors that might occur during the call
    }
}

function formatDonationDetails(donations) {
    return donations.map(donation => {
        const name = donation.name || '-';
        const donationType = donation.donationType || '-';
        const quantity = donation.hasOwnProperty('quantity') ? donation.quantity : '-';
        const value = donation.value || '-';

        return `Name: ${name} | Donation Type: ${donationType} | Quantity: ${quantity} | Value: ${value}\n`;
    }).join('');
}

function arrageData(customer_id) {
    const finalSplitgPaymentArrayString = local.getItem("finalSplitPaymentArray");
    const customerEmail = local.getItem("customerEmail");
    const customerTotalPayment = local.getItem("customerTotalPayment");
    const donationAppeals = local.getItem("donationAppeals");
    let projectSelected = local.getItem("projectSelected");

    const dbPlan = local.getItem("dbPlan");

    console.log("Project Selected: ", projectSelected);
    const finalSplitgPaymentArray = JSON.parse(finalSplitgPaymentArrayString);
    let toInsertCustomerDetails;
    let customerDetails = local.getItem("customerDetails");
    if (customerDetails) {
        let customerDetailsJSON = JSON.parse(customerDetails);
        let projectSelectedDetails = JSON.parse(projectSelected);
        let projectDetails = formatDonationDetails(projectSelectedDetails);
        // Prepare the data object for insertion (adjust field names as necessary)
        toInsertCustomerDetails = {
            firstName: customerDetailsJSON.firstName,
            lastName: customerDetailsJSON.lastName,
            phone: customerDetailsJSON.phone,
            address: customerDetailsJSON.address,
            city: customerDetailsJSON.city,
            zipCode: customerDetailsJSON.zipCode,
            email: customerDetailsJSON.email,
            increaseBy25: customerDetailsJSON.check_increaseby25,
            consent: customerDetailsJSON.check_consent,
            adminCharges: customerDetailsJSON.check_adminCharges,
            plan: customerDetailsJSON.plan,
            totalPayment: customerTotalPayment,
            projectDetails: projectDetails,
            donationAppeals: donationAppeals,

            ramadanPayment: "",
            hajjPayment: "",
            fridayPayment: "",
            zakaatPayment: "",
        };

        if (dbPlan == "ramadan") {
            toInsertCustomerDetails.ramadanPayment = customerTotalPayment
        } else if (dbPlan == "zil_hajj") {
            toInsertCustomerDetails.hajjPayment = customerTotalPayment
        } else if (dbPlan == "friday") {
            toInsertCustomerDetails.fridayPayment = customerTotalPayment
        } else if (dbPlan == "zakaat") {
            toInsertCustomerDetails.zakaatPayment = customerTotalPayment
        }
    }

    const updatedArray = finalSplitgPaymentArray.map(payment => {
        return {
            ...payment, // Spread operator to copy existing properties
            stripe_customer_id: customer_id // Add the 'stripe_customer_id' property
        };
    });

    console.log("updatedArray")
    console.log(updatedArray)

    storeItInDatabase(customerEmail, updatedArray)

    setTimeout(() => {
        sendEmailToContact("info@mercytotheworld.co.uk", "mercytotheworld", "+44 7500 846688", "U6xh0Mc", false, toInsertCustomerDetails);

        console.log("Email Sent to: info@mercytotheworld.co.uk");
        console.log("customerEmail, toInsertCustomerDetails.firstName, toInsertCustomerDetails.phone: ", customerEmail, toInsertCustomerDetails.firstName, toInsertCustomerDetails.phone)
        sendEmailToContact(customerEmail, toInsertCustomerDetails.firstName, toInsertCustomerDetails.phone, "U6lcNKh", true);
    }, 1000);
}

async function storeItInDatabase(customerEmail, originalArray) {

    const email = customerEmail

    try {

        // if this email exists in database, 
        // const results = await wixData.query("splitpayments")
        //     .eq("email", email)
        //     .find();

        const status = local.getItem("status");

        // if (status !== "completed") {
        if (status == "completed") {

            $w('#text1').text = "Oops, looks like you already have this subscription."
            $w('#text2').text = "For the new subcription, go to 'Automate Another Donation' page."

            $w('#button1').show()
            $w('#button2').show()

        } else {
            const customerTotalPayment = local.getItem("customerTotalPayment");
            let customerDetails = local.getItem("customerDetails");
            let projectSelectedTemp = local.getItem("projectSelected");
            let donationAppeals = local.getItem("donationAppeals");
            const dbPlan = local.getItem("dbPlan");

            let projectSelectedArr = projectSelectedTemp ? JSON.parse(projectSelectedTemp) : []
            const projectSelected = projectSelectedArr.reduce((acc, current, index) => {
                acc[index] = current;
                return acc;
            }, {});
            if (customerDetails) {
                let customerDetailsJSON = JSON.parse(customerDetails);
                // Prepare the data object for insertion (adjust field names as necessary)
                let toInsertCustomerDetails = {
                    firstName: customerDetailsJSON.firstName,
                    lastName: customerDetailsJSON.lastName,
                    phone: customerDetailsJSON.phone,
                    address: customerDetailsJSON.address,
                    city: customerDetailsJSON.city,
                    zipCode: customerDetailsJSON.zipCode,
                    email: customerDetailsJSON.email,
                    increaseBy25: customerDetailsJSON.check_increaseby25,
                    consent: customerDetailsJSON.check_consent,
                    adminCharges: customerDetailsJSON.check_adminCharges,
                    plan: customerDetailsJSON.plan,
                    totalAmount: customerTotalPayment,
                    projectSelected: projectSelected,
                    donationAppeals: donationAppeals,

                    ramadanPayment: "",
                    hajjPayment: "",
                    fridayPayment: "",
                    zakaatPayment: "",
                };

                if (dbPlan == "ramadan") {
                    toInsertCustomerDetails.ramadanPayment = customerTotalPayment
                } else if (dbPlan == "zil_hajj") {
                    toInsertCustomerDetails.hajjPayment = customerTotalPayment
                } else if (dbPlan == "friday") {
                    toInsertCustomerDetails.fridayPayment = customerTotalPayment
                } else if (dbPlan == "zakaat") {
                    toInsertCustomerDetails.zakaatPayment = customerTotalPayment
                }

                const result = await wixData.insert("subscribers", toInsertCustomerDetails);
                console.log("Customer details stored successfully:", result);

                const stripe_customer_id = originalArray[0].stripe_customer_id;
                const payment_details = originalArray.map(item => ({
                    _id: item._id,
                    day: item.day,
                    amount: item.amount,
                    dueDate: item.dueDate,
                    status: "unpaid"
                }));

                // if (customerDetailsJSON.check_adminCharges) {
                //     if (customerDetailsJSON.plan.includes("30")) {
                //         // Admin charges on first day
                //         payment_details[28].amount += 1
                //         payment_details[28].day += " + admin charges"
                //     } else {
                //         // Admin charges on first day
                //         payment_details[8].amount += 1
                //         payment_details[8].day += " + admin charges"
                //     }
                // }

                if (customerDetailsJSON.check_adminCharges) {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    // Format tomorrow's date as DD/MM/YYYY
                    let day = tomorrow.getDate().toString().padStart(2, '0'); // Pad with leading 0 if necessary
                    let month = (tomorrow.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add 1
                    let year = tomorrow.getFullYear();
                    let formattedDate = `${day}/${month}/${year}`;

                    const adminChargesObject = {
                        _id: "admincharge_1",
                        day: "Admin charges",
                        amount: 1,
                        dueDate: formattedDate,
                        status: "unpaid"
                    }
                    payment_details.push(adminChargesObject)
                }

                console.log("store it in database...")

                let toInsert = {
                    "email": email,
                    "customerStripeId": stripe_customer_id,
                    "paymentDetails": payment_details
                };

                // Insert the object into the collection
                const insertResult = await wixData.insert("splitpayments", toInsert);

                console.log("Insert successful:", insertResult);

                $w('#text1').text = "Thank you for your Donation"
                $w('#text2').text = "Jazakallah Khair for your generous donation, we pray Almighty Allah give you lots of barakah and accept your sincere donation."

                $w('#text3').text = "If you have any questions about your donation or would like to learn more about other projects, please email us on info@mercytotheworld.co.uk or call us on 07500846688."
                $w('#text3').show();

                $w('#button1').show()
                $w('#button2').show()

                local.setItem("status", "completed")

            }
        }
    } catch (err) {
        console.error("Query error:", err);
        $w('#text1').text = "An error occurred. Please try again.";
        $w('#text2').text = "";
    }
}

// function storeItInDatabase(customerEmail, originalArray) {

//     const email = customerEmail

//     // if this email exists in database, 
//     wixData.query("splitpayments")
//         .eq("email", email)
//         .find()
//         .then(results => {
//             if (results.items.length > 0) {

//                 $w('#text1').text = "Oops, looks like you already have a subscription."
//                 $w('#text2').text = "You'll have to use a different email for a new subscription plan."

//             } else {

//                 const stripe_customer_id = originalArray[0].stripe_customer_id;

//                 const payment_details = originalArray.map(item => ({
//                     _id: item._id,
//                     day: item.day,
//                     amount: item.amount,
//                     dueDate: item.dueDate,
//                     status: "unpaid"
//                 }));

//                 // Admin charges on first day
//                 payment_details[0].amount += 1
//                 payment_details[0].day += " + admin charges"

//                 console.log("store it in database...")

//                 console.log(email)
//                 console.log(stripe_customer_id)
//                 console.log(payment_details)

//                 let toInsert = {
//                     "email": email,
//                     "customerStripeId": stripe_customer_id,
//                     "paymentDetails": payment_details
//                 };

//                 // Insert the object into the collection
//                 wixData.insert("splitpayments", toInsert)
//                     .then((results) => {
//                         console.log("Insert successful:", results);

//                         $w('#text1').text = "Thanks for your donation"
//                         $w('#text2').text = "We've added your split payments in our schedule"
//                     })
//                     .catch((err) => {
//                         console.error("Error inserting item:", err);
//                     });

//             }
//         })
//         .catch(err => {
//             console.error("Query error:", err);
//         })
// }