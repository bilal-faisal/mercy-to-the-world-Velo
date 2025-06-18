///////////////////////////////////////////////////
// These will be different for every page.
// Make sure to update these upon page duplication
///////////////////////////////////////////////////

// wixForm collection ID
const collectionID = "WixForms/11d7cdb3-97db-4edd-8261-4b0a270fece7"

// title from ProgressBar collection
const title = "Projects 2 Template Item"

// Project Titles
const project1Title = "WB Food Pack";
const project2Title = "Gaza Food Pack";

// Donation Form
const donationFormID = "donationForm"

// Project Titles
const projectHeading1 = "textProjectTitle1"
const projectHeading2 = "textProjectTitle2"

// Amount Target Ids
const amountTargetproject1 = "targettext1"
const amountTargetproject2 = "targettext2"

// Amount Collected Ids
const amountCollectedIDproject1 = "collectedtext1"
const amountCollectedIDproject2 = "collectedtext2"

// Amount Remaining Ids
const amountRemainingProject1 = "remainingtext1"
const amountRemainingProject2 = "remainingtext2"

// Current page progress bar Ids
const progressBarIDproject1 = "progressBar1"
const progressBarIDproject2 = "progressBar2"

//////////////////////////////////////
// Do not change any of the code below
//////////////////////////////////////

import wixData from 'wix-data';
import { local } from "wix-storage";
import { getWixFormData2Projects } from 'backend/wixForm.jsw';

let currentProgress = 0
let rowProgressBarCollection = null

$w.onReady(async function () {
    await renderingProgressbar();

    // This function will return you the total of paid amounts 
    const res = await getWixFormData2Projects(collectionID, project1Title, project2Title);
    console.log("getWixFormData2Projects() :", res);
    if (res != undefined && rowProgressBarCollection != null) {
        currentProgress = res; // + rowProgressBarCollection.offlinePayment  
        console.log("true", currentProgress);
    }
    console.log("currentProgress :", currentProgress);
    if (currentProgress && Object.keys(currentProgress).length > 0) {
        updateProgressBarCollection(currentProgress);
        console.log("true updateprogressbarCollection");
    }

    const storedObj = {
        collectionID,
        title,
        project1Title,
        project2Title,
    }

    $w(`#${donationFormID}`).onSubmitSuccess(() => {
        local.setItem("progressBarObj", JSON.stringify(storedObj))
        local.setItem("progressBarType", "two")
    });

    local.setItem("progressBarObj", JSON.stringify(storedObj))
    local.setItem("progressBarType", "two");

});

async function updateProgressBarCollection(backendProgress) {
    console.log("updated Function is called with the :", backendProgress);
    if (!rowProgressBarCollection) {
        console.error("rowProgressBarCollection is not initialized");
        return;
    }

    const offlinePaymentProject1 = rowProgressBarCollection.offlinePaymentProject1 || 0
    const offlinePaymentProject2 = rowProgressBarCollection.offlinePaymentProject2 || 0

    const unitPriceProject1 = rowProgressBarCollection.unitPriceProject1 || 1
    const unitPriceProject2 = rowProgressBarCollection.unitPriceProject2 || 1

    // Map backend response to progress values
    let updatedProgress = {
        progressProject1: backendProgress[project1Title] || 0,
        progressProject2: backendProgress[project2Title] || 0,
    };
    // Get target values from rowProgressBarCollection
    let targetValues = {
        targetProject1: rowProgressBarCollection.goalProject1 || 0,
        targetProject2: rowProgressBarCollection.goalProject2 || 0,
    };

    $w(`#${projectHeading1}`).text = project1Title
    $w(`#${projectHeading2}`).text = project2Title

    // Update the UI progress bars
    $w(`#${progressBarIDproject1}`).value = updatedProgress.progressProject1 + offlinePaymentProject1;
    $w(`#${progressBarIDproject2}`).value = updatedProgress.progressProject2 + offlinePaymentProject2;

    // Update text fields with formatted progress amounts
    $w(`#${amountCollectedIDproject1}`).text = formatAndTruncate((updatedProgress.progressProject1 + offlinePaymentProject1) / unitPriceProject1, 0);
    $w(`#${amountCollectedIDproject2}`).text = formatAndTruncate((updatedProgress.progressProject2 + offlinePaymentProject2) / unitPriceProject2, 0);

    // Update target amounts (textTarget)
    $w(`#${amountTargetproject1}`).text = formatAndTruncate(targetValues.targetProject1 / unitPriceProject1, 0);
    $w(`#${amountTargetproject2}`).text = formatAndTruncate(targetValues.targetProject2 / unitPriceProject2, 0);

    // Calculate remaining amounts
    let remaining1 = Math.max(0, rowProgressBarCollection.goalProject1 - offlinePaymentProject1 - updatedProgress.progressProject1);
    let remaining2 = Math.max(0, rowProgressBarCollection.goalProject2 - offlinePaymentProject2 - updatedProgress.progressProject2);

    $w(`#${amountRemainingProject1}`).text = formatAndTruncate(remaining1 / unitPriceProject1, 0);
    $w(`#${amountRemainingProject2}`).text = formatAndTruncate(remaining2 / unitPriceProject2, 0);

    console.log("=================")
    console.log("=================")
    console.log("=================")
    console.log("updatedProgress")
    console.log(updatedProgress)
    console.log("rowProgressBarCollection")
    console.log(rowProgressBarCollection)
    // Update database only if values have changed
    if (
        rowProgressBarCollection.progressProject1 !== updatedProgress.progressProject1 ||
        rowProgressBarCollection.progressProject2 !== updatedProgress.progressProject2
    ) {
        try {
            console.log("Updating rowProgressBarCollection with new progress values...");
            console.log({
                ...rowProgressBarCollection,
                ...updatedProgress
            })
            rowProgressBarCollection = await wixData.update("Progressbar2Projects", {
                ...rowProgressBarCollection,
                ...updatedProgress
            });
            console.log("ProgressBar collection updated successfully:", rowProgressBarCollection);
        } catch (error) {
            console.error("Error while updating progress:", error);
        }
    } else {
        console.log("No changes found, no need to update");
    }
}

function formatAndTruncate(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    let truncated = (Math.floor(num * factor) / factor).toFixed(decimalPlaces);

    // Remove decimal part if it's all zeros
    if (truncated.endsWith("." + "0".repeat(decimalPlaces))) {
        truncated = truncated.split(".")[0]; // Remove decimal part
    }

    // Format with commas
    return truncated.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function renderingProgressbar() {
    try {
        const response = await wixData.query("Progressbar2Projects").eq("title", title).find();
        if (response.items.length > 0) {
            rowProgressBarCollection = response.items[0]
            console.log("Progressbar2Projects :", rowProgressBarCollection);
            //progress bar project1
            $w(`#${progressBarIDproject1}`).value = rowProgressBarCollection.progressProject1 //+ rowProgressBarCollection.offlinePayment; // initial progress
            $w(`#${progressBarIDproject1}`).targetValue = rowProgressBarCollection.goalProject1; // goal
            //progress bar project2
            $w(`#${progressBarIDproject2}`).value = rowProgressBarCollection.progressProject2 //+ rowProgressBarCollection.offlinePayment; // initial progress
            $w(`#${progressBarIDproject2}`).targetValue = rowProgressBarCollection.goalProject2; // goal
            console.log($w(`#${progressBarIDproject2}`).targetValue); //rowProgressBarCollection.goalProject2; // goal

        } else {
            console.log("Result not found in ProgressBar collection")
            $w(`#${progressBarIDproject1}`).collapse()
            $w(`#${progressBarIDproject2}`).collapse()
        }
    } catch (error) {
        console.log("error :", error);
        // $w(`#${progressBarID}`).collapse()
        $w(`#${progressBarIDproject1}`).collapse()
        $w(`#${progressBarIDproject2}`).collapse()
    }
}