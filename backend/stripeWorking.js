///////////////////////////////////
//// This is an actual working page, not testing one
///////////////////////////////////

import Stripe from 'stripe';
import wixData from 'wix-data';

const stripeAPIKey = ""
const stripe = new Stripe(stripeAPIKey);

export async function createProduct(name, description) {
    return await stripe.products.create({
        name,
        description
    });
}

export async function createOneTimePrice(productId, amount) {
    return await stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency: 'gbp',
    });
}

export async function createCheckoutSessionForSinglePayment(oneTimePriceId) {
    return await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
            price: oneTimePriceId,
            quantity: 1
        }],
        success_url: 'https://www.mercytotheworld.co.uk/stripe-payment-success',
        cancel_url: 'https://www.mercytotheworld.co.uk/stripe-payment-failure',
    });
}

////////////////////////////////
////////////////////////////////

export async function createRecurringPrice(productId, amount) {
    return await stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency: 'gbp',
        recurring: { interval: "week", interval_count: 1 }, // weekly recurrence
    });
}
export async function createCheckoutSessionForRecurringPayment(recurringPriceId) {
    // export async function createCheckoutSessionForRecurringPayment(oneTimePriceId, recurringPriceId) {

    const startOnNextFriday = getUpcomingFridayTimestamp(); // Calculate the timestamp for the next Friday
    console.log("startOnNextFriday");
    console.log(startOnNextFriday);

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            //   {
            //     price: oneTimePriceId,
            //     quantity: 1,
            //   },
            {
                price: recurringPriceId,
                quantity: 1,
            },
        ],
        subscription_data: {
            billing_cycle_anchor: startOnNextFriday,
            proration_behavior: 'none',
        },
        success_url: 'https://www.mercytotheworld.co.uk/stripe-payment-success',
        cancel_url: 'https://www.mercytotheworld.co.uk/stripe-payment-failure',
    });

    return session;
}

// export async function createCheckoutSessionForRecurringPayment(oneTimePriceId, recurringPriceId) {

//     const startOnNextFriday = getUpcomingFridayTimestamp(); // Calculate the timestamp for the next Friday
//     console.log("startOnNextFriday")
//     console.log(startOnNextFriday)
//     return await stripe.checkout.sessions.create({
//         mode: 'subscription',
//         payment_method_types: ['card'],
//         line_items: [{
//                 price: oneTimePriceId,
//                 quantity: 1,
//             },
//             {
//                 price: recurringPriceId,
//                 quantity: 1,
//             }
//         ],
//         subscription_data: {
//             billing_cycle_anchor: startOnNextFriday, // Use billing_cycle_anchor
//         },
//         success_url: 'https://www.mercytotheworld.co.uk/stripe-payment-success',
//         cancel_url: 'https://www.mercytotheworld.co.uk/stripe-payment-failure',
//     });

// }

export function getUpcomingFridayTimestamp() {
    const today = new Date(); // Get today's date
    const dayOfWeek = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let daysUntilFriday = 5 - dayOfWeek; // Calculate days until next Friday

    // Adjust days until Friday to avoid setting a date too far in the future
    if (daysUntilFriday < 0 || (daysUntilFriday === 0 && today.getHours() > 0)) {
        daysUntilFriday += 7;
    }

    const upcomingFriday = new Date(today); // Create a new Date object to avoid modifying the original 'today'
    upcomingFriday.setDate(today.getDate() + daysUntilFriday); // Add the days until next Friday
    upcomingFriday.setHours(0, 0, 0, 0); // Set time to 00:00:00.000 for consistency

    console.log(upcomingFriday.getTime());
    return Math.floor(upcomingFriday.getTime() / 1000); // Return the timestamp in seconds
}

// function getUpcomingFridayTimestamp() {
//     const today = new Date(); // Get today's date
//     const dayOfWeek = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
//     let daysUntilFriday = 5 - dayOfWeek; // Calculate days until next Friday

//     // Adjust days until Friday to avoid setting a date too far in the future
//     if (daysUntilFriday < 0 ) {
//         daysUntilFriday += 7;
//     }

//     const upcomingFriday = new Date(today); // Create a new Date object to avoid modifying the original 'today'
//     upcomingFriday.setDate(today.getDate() + daysUntilFriday); // Add the days until next Friday
//     upcomingFriday.setHours(23, 58, 0); // Set time to 00:00:00.000 for consistency

//     console.log(upcomingFriday.getTime());
//     return Math.floor(upcomingFriday.getTime() / 1000); // Return the timestamp in seconds
// }

////////////////////////////////
////////////////////////////////

const paymentsObject = {
    "2024-03-07": [{
            "day": "1st day",
            "userId": "user1",
            "stripe_session_id": "cs_test_c1tuIhsyVbVJlf2IyDkQCvDpJ4Zq53HZB9BY5XePP50cYmxDMgBRLzyWTP",
            "stripe_customer_id": "cus_Ph9OuYh4ZKfpjl",
            "amount": 2.07,
        },
        {
            "day": "1st day",
            "userId": "user2",
            "stripe_session_id": "cs_test_c1FsI6cKhgv25GlI74VsiZwxUGdNDHXkNuq1lh6MvxYztNM2D1jU9QBbTZ",
            "stripe_customer_id": "cus_Ph74a3qh7jdxto",
            "amount": 34.57,
        },
        {
            "day": "1st day",
            "userId": "user3",
            "stripe_session_id": "cs_test_c1FsI6cKhgv25GlI74VsiZwxUGdNDHXkNuq1lh6MvxYztNM2D1jU9QBbTZ",
            "stripe_customer_id": "cus_Ph74a3qh7jdxto",
            "amount": 15.06,
        }
    ],
    "2024-03-08": [{
            "day": "2nd day",
            "userId": "user1",
            "stripe_session_id": "cs_test_c1tuIhsyVbVJlf2IyDkQCvDpJ4Zq53HZB9BY5XePP50cYmxDMgBRLzyWTP",
            "stripe_customer_id": "cus_Ph9OuYh4ZKfpjl",
            "amount": 2.07,
        },
        {
            "day": "2nd day",
            "userId": "user2",
            "stripe_session_id": "cs_test_c1FsI6cKhgv25GlI74VsiZwxUGdNDHXkNuq1lh6MvxYztNM2D1jU9QBbTZ",
            "stripe_customer_id": "cus_Ph74a3qh7jdxto",
            "amount": 34.57,
        },
        {
            "day": "2nd day",
            "userId": "user2",
            "stripe_session_id": "cs_test_c1FsI6cKhgv25GlI74VsiZwxUGdNDHXkNuq1lh6MvxYztNM2D1jU9QBbTZ",
            "stripe_customer_id": "cus_Ph74a3qh7jdxto",
            "amount": 15.06,
        }
    ]
}

// This function now initiates a Checkout session to collect payment details
// and ensures a customer record exists or is created.
export async function createCheckoutSessionForNewOrExistingCustomer(userEmail) {
    // Try to find an existing customer first
    let customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
        customer = customers.data[0];
    } else {
        // No customer found, so create a new one
        customer = await stripe.customers.create({
            email: userEmail,
        });
    }

    // Create a Stripe Checkout session for the customer to enter payment details
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customer.id, // Associate with the existing or new customer
        mode: 'setup', // Setup mode for collecting payment details without charging
        success_url: 'https://www.mercytotheworld.co.uk/split-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://www.mercytotheworld.co.uk/stripe-payment-failure',
    });

    return session; // Return the session, which includes an URL to the Checkout page
}

export async function handleSessionCompletion(sessionId) {
    try {
        // Retrieve the completed Checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.mode !== 'setup') {
            throw new Error("Session is not in 'setup' mode.");
        }

        // Retrieve the SetupIntent to get the payment method used in the session
        const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent);
        if (!setupIntent.payment_method) {
            throw new Error("No payment method found in SetupIntent.");
        }

        // Update the customer's default payment method to the one used in the SetupIntent
        await stripe.customers.update(session.customer, {
            invoice_settings: {
                default_payment_method: setupIntent.payment_method,
            },
        });

        const customer_id = session.customer;

        console.log(`Default payment method for customer ${session.customer} has been updated.`);

        return { customer_id: customer_id };
    } catch (error) {
        console.error(`Failed to complete session handling: ${error.message}`);
        return false;
    }
}

// Function scheduled to run daily
export async function handleScheduledPayments() {
    console.log('Scheduled payment handling function starts executing.');

    const today = getTodaysDateFormatted(); // Format as DD/MM/YYYY
    // const today = "09/06/2024"

    // console.log("today")
    // console.log(today)

    const paymentsDueToday = await getPaymentsDueToday(today)

    // console.log("paymentsDueToday")
    // console.log(paymentsDueToday)

    if (!paymentsDueToday || paymentsDueToday.length === 0) {
        console.log("No payments due today.");
        return;
    }

    // paymentsDueToday.forEach(async (payment) => {
    for (const payment of paymentsDueToday) {

        if (payment.status !== "unpaid") {
            console.log(`Payment for ${payment.day} is not unpaid (current status: ${payment.status}), skipping.`);
            continue;
        }

        const customer_id = payment.stripe_customer_id;

        if (!customer_id) {
            console.log(`No customer ID associated with ${payment.stripe_customer_id}, skipping.`);
            continue;
        }

        // Now that you have the customer ID, check if the customer has a default payment method set
        const customer = await stripe.customers.retrieve(customer_id);
        if (!customer.invoice_settings.default_payment_method) {
            console.log(`No default payment method for customer ${customer_id}, skipping.`);
            // Optionally, prompt the user to add a payment method
            continue;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(payment.amount * 100), // Amount in cents
            currency: 'gbp',
            customer: customer_id,
            payment_method: customer.invoice_settings.default_payment_method,
            description: `Payment for ${payment.day}`,
            confirm: true, // Confirm the payment immediately
            off_session: true, // Indicates that the payment is happening off-session
        });

        if (paymentIntent.status === 'succeeded') {
            console.log(`Payment succeeded for ${payment.day}, customer ${customer_id}`);
            // update status for customer_id on date 'today'
            await updatePaymentStatus(customer_id, today);

        } else {
            console.error(`Payment failed for ${payment.day}, customer ${customer_id}`);
        }
    }

}

export async function getPaymentsDueToday(today) {

    let paymentsObject = {};

    // Fetch payment details where 'dueDate' is today or criteria matches
    // Note: Adjust the query as needed based on your collection's structure
    const results = await wixData.query("splitpayments")
        .find()
        .then(res => res.items);

    // // Process each payment detail
    results.forEach(item => {

        item.paymentDetails.forEach(payment => {
            const dueDate = payment.dueDate // DD/MM/YYYY format
            if (!paymentsObject[dueDate]) {
                paymentsObject[dueDate] = [];
            }
            paymentsObject[dueDate].push({
                amount: payment.amount,
                status: payment.status,
                stripe_customer_id: item.customerStripeId,
                // day: item.day,
                day: payment.day || payment.night,
            });
        });
    });

    // return paymentsObject
    return paymentsObject[today]
}

function getTodaysDateFormatted() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Ensures two digits
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();

    return `${day}/${month}/${year}`; // Formats as DD/MM/YYYY
}

export async function updatePaymentStatus(customer_id, today) {

    try {
        const results = await wixData.query("splitpayments")
            .eq("customerStripeId", customer_id)
            .find()
            .then(res => res.items);

        if (results.length > 0) {

            ///////////////////////////////
            // Prev Method (causing bug) //
            ///////////////////////////////

            // const result = results[0];
            // let isUpdated = false;

            // result.paymentDetails.forEach(paymentDetail => {
            //     if (paymentDetail.dueDate === today && paymentDetail.status === "unpaid") {
            //         paymentDetail.status = "paid"; // Update the status to 'paid'
            //         isUpdated = true;
            //     }
            // });

            // if (isUpdated) {
            //     await wixData.update("splitpayments", result);
            //     console.log("Payment status updated successfully.");
            // } else {
            //     console.log("No payment details updated. Either no payments are due today or they are already paid.");
            // }

            //////

            for (const result of results) {
                let isUpdated = false;
                const id = result._id;

                result.paymentDetails.forEach(paymentDetail => {
                    if (paymentDetail.dueDate === today && paymentDetail.status === "unpaid") {
                        paymentDetail.status = "paid"; // Update the status to 'paid'
                        isUpdated = true;
                    }
                });

                if (isUpdated) {
                    await wixData.update("splitpayments", result);
                    console.log(`Payment status updated successfully for record ID: ${id}`);
                } else {
                    console.log(`No payment details updated for record ID: ${id}. Either no payments are due today or they are already paid.`);
                }
            }

        } else {
            console.log("No records found for the given customer ID.");
        }

    } catch (error) {
        console.error(`An error occurred while updating payment status: ${error}`);
    }
}