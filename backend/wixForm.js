import wixData from 'wix-data';

// export async function getWixFormData(collectionID) {
//     try {
//         // Await the query to resolve
//         const results = await wixData.query(collectionID).find({ suppressAuth: true });

//         // Filter out items with 'CONFIRMED' status
//         const confirmedDonations = results.items.filter(item => item.status === "CONFIRMED");

//         console.log("confirmedDonations :", confirmedDonations);

//         // Calculate the total sum of confirmed donations
//         const totalDonationAmount = confirmedDonations.reduce((sum, item) => {
//             try {
//                 let donationAmountStr = "£0"; // Default to £0 if missing

//                 // Check for donation_47cb field (if exists)
//                 if (item.donation_47cb && Array.isArray(item.donation_47cb) && item.donation_47cb[0]?.[0]) {
//                     donationAmountStr = item.donation_47cb[0][0];
//                 }
//                 // Check for form_field field (if exists)
//                 else if (item.form_field && Array.isArray(item.form_field) && item.form_field[0]?.[1]) {
//                     donationAmountStr = item.form_field[0][1];
//                 }

//                 // Remove '£' and convert to float
//                 const donationAmount = parseFloat(donationAmountStr.replace('£', ''));

//                 return sum + (isNaN(donationAmount) ? 0 : donationAmount);
//             } catch (err) {
//                 console.error("Error parsing donation amount:", err);
//                 return sum; // Skip this item if an error occurs
//             }
//         }, 0);

//         console.log(`Total Confirmed Donations: £${totalDonationAmount.toFixed(2)}`);

//         return Number(totalDonationAmount.toFixed(2));
//     } catch (err) {
//         console.error(err);
//         return undefined;
//     }
// }

export async function getWixFormData(collectionID) {
    try {
        const results = await wixData.query(collectionID).find({ suppressAuth: true });
        const confirmedDonations = results.items.filter(item => item.status === "CONFIRMED");

        console.log("Confirmed Donations:", confirmedDonations);

        const totalDonationAmount = confirmedDonations.reduce((sum, item) => {
            try {
                let donationAmount1 = 0;
                let donationAmount2 = 0;

                // Extract donation amount from donation_47cb
                if (item.donation_47cb && Array.isArray(item.donation_47cb) && item.donation_47cb[0]?.[0]) {
                    donationAmount1 = parseFloat(item.donation_47cb[0][0].replace('£', '')) || 0;
                }

                // Extract donation amount from form_field
                if (item.form_field && Array.isArray(item.form_field)) {
                    item.form_field.forEach(field => {
                        let amount = 0;
                        let quantity = 1;

                        field.forEach(value => {
                            if (typeof value === 'string' && value.startsWith('£')) {
                                amount = parseFloat(value.replace('£', '')) || 0;
                            } else if (!isNaN(value) && typeof value !== 'boolean') {
                                quantity = parseInt(value) || 1;
                            }
                        });

                        donationAmount2 += amount * quantity;
                    });
                }

                // If both exist and are equal, take one. Otherwise, sum them.
                const totalItemDonation = (donationAmount1 === donationAmount2) ?
                    donationAmount1 :
                    (donationAmount1 + donationAmount2);

                return sum + totalItemDonation;
            } catch (err) {
                console.error("Error parsing donation amount:", err);
                return sum;
            }
        }, 0);

        console.log(`Total Confirmed Donations: £${totalDonationAmount.toFixed(2)}`);

        return Number(totalDonationAmount.toFixed(2));
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

export async function getOrderDetails(orderId) {
    try {
        const result = await wixData.query("Stores/Orders") // Query Wix Orders collection
            .eq("_id", orderId)
            .find({ suppressAuth: true });

        if (result.items.length > 0) {
            return result.items[0]; // Return the first matching order
        } else {
            throw new Error("Order not found.");
        }
    } catch (error) {
        console.error("Error fetching order details:", error);
        throw new Error("Could not retrieve order details.");
    }
}

// export async function getWixFormData4Projects(collectionID, project1Title, project2Title, project3Title, project4Title) {
//     try {
//         const results = await wixData.query(collectionID).find({ suppressAuth: true });
//         const confirmedDonations = results.items.filter(item => item.status === "CONFIRMED");

//         console.log("Confirmed Donations:", confirmedDonations);

//         return confirmedDonations;
//     } catch (err) {
//         console.error(err);
//         return undefined;
//     }
// }

let tempData = [{
        "donation_47cb": null,
        "_id": "11afe3cc-e569-4cab-92bc-8c5d06208d29",
        "add_donation_notes": null,
        "form_field": [
            [
                "WB Food Pack",
                "£25",
                2
            ],
            [
                "Gaza Food Pack",
                "£30"
            ],
            [
                "Gaza Iftaar Meal",
                "£1"
            ],
            [
                "WB Iftaar Meal",
                "£2"
            ]
        ],
        "status": "CONFIRMED",
        "donation_type": "Zakaat",
        "createdDate": "2025-02-18T17:40:14.112Z"
    },
    {
        "donation_47cb": null,
        "_id": "11afe3cc-e569-4cab-92bc-8c5d06208x29",
        "add_donation_notes": null,
        "form_field": [
            [
                "WB Food Pack",
                "£25",
                2
            ],
            [
                "Gaza Food Pack",
                "£30"
            ],
            [
                "Gaza Iftaar Meal",
                "£1"
            ],
            [
                "WB Iftaar Meal",
                "£2"
            ]
        ],
        "status": "CONFIRMED",
        "donation_type": "Zakaat",
        "createdDate": "2025-02-18T17:40:14.112Z"
    }
]

// export async function getWixFormData4ProjectsPrev(collectionID, project1Title, project2Title, project3Title, project4Title) {
//     try {
//         const results = await wixData.query(collectionID).find({ suppressAuth: true });
//         const confirmedDonations = results.items.filter(item => item.status === "CONFIRMED");

//         console.log(confirmedDonations)

//         // Initialize project totals with all passed project titles
//         const projectTotals = {
//             [project1Title]: 0,
//             [project2Title]: 0,
//             [project3Title]: 0,
//             [project4Title]: 0
//         };

//         confirmedDonations.forEach(donation => {
//             const formFields = donation.form_field;
//             if (!formFields) return;

//             formFields.forEach(field => {
//                 if (!Array.isArray(field) || field.length < 2) return;

//                 const [projectTitle, amountStr] = field;
//                 const quantity = field.length >= 3 ? field[2] : 1;

//                 // Only process if the project exists in our totals
//                 if (Object.prototype.hasOwnProperty.call(projectTotals, projectTitle)) {
//                     const amount = parseFloat(amountStr.toString().replace(/£/g, ''));
//                     const numericQuantity = typeof quantity === 'number' ? quantity : 1;

//                     projectTotals[projectTitle] += amount * numericQuantity;
//                 }
//             });
//         });

//         // Round to 2 decimal places to avoid floating point precision issues
//         Object.keys(projectTotals).forEach(project => {
//             projectTotals[project] = Math.round(projectTotals[project] * 100) / 100;
//         });

//         return projectTotals;

//     } catch (err) {
//         console.error(err);
//         return undefined;
//     }
// }

export async function getWixFormData2Projects(collectionID, project1Title, project2Title) {
    return await getWixFormDataForProjects(collectionID, project1Title, project2Title);
}

export async function getWixFormData3Projects(collectionID, project1Title, project2Title, project3Title) {
    return await getWixFormDataForProjects(collectionID, project1Title, project2Title, project3Title);
}

export async function getWixFormData4Projects(collectionID, project1Title, project2Title, project3Title, project4Title) {
    return await getWixFormDataForProjects(collectionID, project1Title, project2Title, project3Title, project4Title);
}

// General function to handle any number of projects
async function getWixFormDataForProjects(collectionID, ...projectTitles) {
    try {
        const results = await wixData.query(collectionID).find({ suppressAuth: true });
        const confirmedDonations = results.items.filter(item => item.status === "CONFIRMED");
        // const confirmedDonations = results.items.filter(item => item.status === "PAYMENT_WAITING");

        console.log(confirmedDonations);

        // Initialize project totals
        const projectTotals = {};
        projectTitles.forEach(title => projectTotals[title] = 0);

        confirmedDonations.forEach(donation => {
            const formFields = donation.form_field;
            if (!formFields) return;

            formFields.forEach(field => {
                if (!Array.isArray(field) || field.length < 2) return;

                const [projectTitle, amountStr] = field;
                const quantity = field.length >= 3 ? field[2] : 1;

                if (Object.prototype.hasOwnProperty.call(projectTotals, projectTitle)) {
                    const amount = parseFloat(amountStr.toString().replace(/£/g, ''));
                    const numericQuantity = typeof quantity === 'number' ? quantity : 1;

                    projectTotals[projectTitle] += amount * numericQuantity;
                }
            });
        });

        // Round values to 2 decimal places
        Object.keys(projectTotals).forEach(project => {
            projectTotals[project] = Math.round(projectTotals[project] * 100) / 100;
        });

        return projectTotals;

    } catch (err) {
        console.error(err);
        return undefined;
    }
}