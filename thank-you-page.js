//////////////////////////////////////
// Do not change any of the code below
//////////////////////////////////////

import wixData from 'wix-data';
import { local } from "wix-storage";
import { getWixFormData, getWixFormData2Projects, getWixFormData3Projects, getWixFormData4Projects } from 'backend/wixForm.jsw';

$w.onReady(async function () {

    const progressBarType = local.getItem("progressBarType");
    if (!progressBarType) {
        console.error("Progress bar type is missing in localStorage.");
        return;
    }

    // Retrieve stored data from local storage
    const storedObjStr = local.getItem("progressBarObj");
    if (!storedObjStr) {
        console.error("storedObjStr is missing in localStorage.");
        return;
    }

    let storedObj = null
    try {
        storedObj = JSON.parse(storedObjStr)
    } catch (error) {
        console.error("Error parsing progressBarObj from localStorage:", error);
        return;
    }

    if (storedObj === null) {
        console.error("Invalid storedObj in localStorage.");
        return;
    }

    if (progressBarType === "single") {
        await processSingle(storedObj)
    } else if (progressBarType === "two") {
        await process2Projects(storedObj)
    } else if (progressBarType === "three") {
        await process3Projects(storedObj)
    } else if (progressBarType === "four") {
        await process4Projects(storedObj)
    }

});

async function process2Projects(storedObj) {
    console.log("Stored Object for 2 Projects:");
    console.log(storedObj);

    const title = storedObj.title;
    const collectionID = storedObj.collectionID;
    const project1Title = storedObj.project1Title;
    const project2Title = storedObj.project2Title;

    if (!collectionID || !title) {
        console.error("Missing collectionID or title in localStorage data.");
        return;
    }

    if (!project1Title || !project2Title) {
        console.error("Missing one or more project titles in localStorage data.");
        return;
    }

    try {
        // Fetch the latest paid amounts for 2 projects
        const res = await getWixFormData2Projects(collectionID, project1Title, project2Title);

        if (res === undefined) {
            console.error("Backend function for 2 projects is returning undefined.");
            return;
        }

        const currentProgress = {
            progressProject1: res[project1Title] || 0,
            progressProject2: res[project2Title] || 0
        };

        // Update progress bar collection in database
        await updateProgressBarCollection2Projects(currentProgress, "Progressbar2Projects", title);

    } catch (error) {
        console.error("Error processing localStorage data for 2 projects:", error);
    }
}

async function updateProgressBarCollection2Projects(currentProgress, collectionName, title) {
    console.log("Current Progress for 2 Projects:");
    console.log(currentProgress);

    try {
        // Get existing row for this progress bar
        const response = await wixData.query(collectionName).eq("title", title).find();
        if (response.items.length === 0) {
            console.warn("No matching ProgressBar entry found for 2 projects.");
            return;
        }

        const rowProgressBarCollection = response.items[0];

        console.log("Row Progress Bar Collection for 2 Projects:");
        console.log(rowProgressBarCollection);

        // Check if progress has changed before updating
        if (
            rowProgressBarCollection.progressProject1 !== currentProgress.progressProject1 ||
            rowProgressBarCollection.progressProject2 !== currentProgress.progressProject2
        ) {
            await wixData.update(collectionName, {
                ...rowProgressBarCollection,
                ...currentProgress
            });
            console.log("Progress updated successfully for 2 projects.");
        } else {
            console.log("No changes detected in progress values for 2 projects, skipping database update.");
        }

    } catch (error) {
        console.error("Error updating progress bar collection for 2 projects:", error);
    }
}

async function process3Projects(storedObj) {
    console.log("Stored Object for 3 Projects:");
    console.log(storedObj);

    const title = storedObj.title;
    const collectionID = storedObj.collectionID;
    const project1Title = storedObj.project1Title;
    const project2Title = storedObj.project2Title;
    const project3Title = storedObj.project3Title;

    if (!collectionID || !title) {
        console.error("Missing collectionID or title in localStorage data.");
        return;
    }

    if (!project1Title || !project2Title || !project3Title) {
        console.error("Missing one or more project titles in localStorage data.");
        return;
    }

    try {
        // Fetch the latest paid amounts for 3 projects
        const res = await getWixFormData3Projects(collectionID, project1Title, project2Title, project3Title);

        if (res === undefined) {
            console.error("Backend function for 3 projects is returning undefined.");
            return;
        }

        const currentProgress = {
            progressProject1: res[project1Title] || 0,
            progressProject2: res[project2Title] || 0,
            progressProject3: res[project3Title] || 0
        };

        // Update progress bar collection in database
        await updateProgressBarCollection3Projects(currentProgress, "Progressbar3Projects", title);

    } catch (error) {
        console.error("Error processing localStorage data for 3 projects:", error);
    }
}

async function updateProgressBarCollection3Projects(currentProgress, collectionName, title) {
    console.log("Current Progress for 3 Projects:");
    console.log(currentProgress);

    try {
        // Get existing row for this progress bar
        const response = await wixData.query(collectionName).eq("title", title).find();
        if (response.items.length === 0) {
            console.warn("No matching ProgressBar entry found for 3 projects.");
            return;
        }

        const rowProgressBarCollection = response.items[0];

        console.log("Row Progress Bar Collection for 3 Projects:");
        console.log(rowProgressBarCollection);

        // Check if progress has changed before updating
        if (
            rowProgressBarCollection.progressProject1 !== currentProgress.progressProject1 ||
            rowProgressBarCollection.progressProject2 !== currentProgress.progressProject2 ||
            rowProgressBarCollection.progressProject3 !== currentProgress.progressProject3
        ) {
            await wixData.update(collectionName, {
                ...rowProgressBarCollection,
                ...currentProgress
            });
            console.log("Progress updated successfully for 3 projects.");
        } else {
            console.log("No changes detected in progress values for 3 projects, skipping database update.");
        }

    } catch (error) {
        console.error("Error updating progress bar collection for 3 projects:", error);
    }
}

async function process4Projects(storedObj) {
    console.log("storedObj")
    console.log(storedObj)

    const title = storedObj.title;
    const collectionID = storedObj.collectionID;
    const project1Title = storedObj.project1Title
    const project2Title = storedObj.project2Title
    const project3Title = storedObj.project3Title
    const project4Title = storedObj.project4Title

    if (!collectionID || !title) {
        console.error("Missing collectionID or title in localStorage data.");
        return;
    }

    if (!project1Title || !project2Title || !project3Title || !project4Title) {
        console.error("Missing one or more project titles in localStorage data.");
        return;
    }

    try {
        // Fetch the latest paid amounts for 4 projects
        const res = await getWixFormData4Projects(collectionID,
            project1Title, project2Title, project3Title, project4Title);

        if (res === undefined) {
            console.error("Backend function is returning undefined")
            return;
        }

        const currentProgress = {
            progressProject1: res[project1Title] || 0,
            progressProject2: res[project2Title] || 0,
            progressProject3: res[project3Title] || 0,
            progressProject4: res[project4Title] || 0
        };

        // Update progress bar collection in database
        await updateProgressBarCollection4Projects(currentProgress, "Progressbar4Projects", title);

    } catch (error) {
        console.error("Error processing localStorage data:", error);
    }
}

async function updateProgressBarCollection4Projects(currentProgress, collectionName, title) {

    console.log("currentProgress")
    console.log(currentProgress)

    try {
        // Get existing row for this progress bar
        const response = await wixData.query(collectionName).eq("title", title).find();
        if (response.items.length === 0) {
            console.warn("No matching ProgressBar entry found.");
            return;
        }

        const rowProgressBarCollection = response.items[0];

        console.log("rowProgressBarCollection")
        console.log(rowProgressBarCollection)
        // Check if progress has changed before updating
        if (
            rowProgressBarCollection.progressProject1 !== currentProgress.progressProject1 ||
            rowProgressBarCollection.progressProject2 !== currentProgress.progressProject2 ||
            rowProgressBarCollection.progressProject3 !== currentProgress.progressProject3 ||
            rowProgressBarCollection.progressProject4 !== currentProgress.progressProject4
        ) {
            await wixData.update(collectionName, {
                ...rowProgressBarCollection,
                ...currentProgress
            });
            console.log("Progress updated successfully for 4 projects.");
        } else {
            console.log("No changes detected in progress values, skipping database update.");
        }

    } catch (error) {
        console.error("Error updating progress bar collection:", error);
    }
}

async function processSingle(storedObj) {

    const title = storedObj.title;
    const collectionID = storedObj.collectionID;

    if (!collectionID || !title) {
        console.error("Missing collectionID or title in localStorage data.");
        return;
    }

    try {
        // Fetch latest paid amounts
        const res = await getWixFormData(collectionID);
        if (res === undefined) {
            console.error("Backend function is returning undefined")
            return;
        }

        const currentProgress = res;

        // Update progress bar collection in database
        await updateProgressBarCollectionSingle(currentProgress, "Progressbar", title);

    } catch (error) {
        console.error("Error processing localStorage data:", error);
    }
}

async function updateProgressBarCollectionSingle(currentProgress, collectionName, title) {

    try {
        // Get existing row for this progress bar
        const response = await wixData.query(collectionName).eq("title", title).find();
        if (response.items.length === 0) {
            console.warn("No matching ProgressBar entry found.");
            return;
        }

        const rowProgressBarCollection = response.items[0];

        // Only update if progress has changed
        if (rowProgressBarCollection.progress !== currentProgress) {
            await wixData.update(collectionName, {
                ...rowProgressBarCollection,
                progress: currentProgress
            });
            console.log("Progress updated successfully.");
        }

    } catch (error) {
        console.error("Error updating progress bar collection:", error);
    }
}

// import wixLocation from 'wix-location';
// import { getOrderDetails } from 'backend/wixForm';

// $w.onReady(async function () {
//     // Extract order ID from the URL path
//     const pathSegments = wixLocation.path;
//     const orderId = pathSegments.length > 1 ? pathSegments[1] : null;

//     console.log("Extracted Order ID:", orderId);

//     if (orderId) {
//         try {
//             const orderDetails = await getOrderDetails(orderId); // Fetch details from backend
//             console.log("Order Details:", orderDetails);

//         } catch (error) {
//             console.error("Error fetching order details:", error);
//         }
//     } else {
//         console.warn("No order ID found in the URL.");
//     }
// });