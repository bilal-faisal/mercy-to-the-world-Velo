///////////////////////////////////////////////////
// These will be different for every page.
// Make sure to update these upon page duplication
///////////////////////////////////////////////////

// wixForm collection ID
const collectionID = "WixForms/5b40697a-461c-4e0e-baea-b298faebc619"

// title from ProgressBar collection
const title = "Template Fundraising"

// Current page progress bar id
const progressBarID = "progressBar"

// Donation Form
const donationFormID = "donationForm"

// Amount Target
const amountTarget = "textTarget"

// Amount Collected
const amountCollectedID = "textCollected"

// Amount Remaining
const amountRemaining = "textRemaining"

///
// Below three should be empty if this section is not required in this page
///

// Target (Total units to raise)
const unitsToRaiseTargetID = "textNumberTarget"

// Units raised till now
const unitsRaisedTillNowID = "textNumberRaisedTillNow"

// Remaining Units to raise
const unitsRemainingToRaise = "textNumberRemaining"

// Group ID containing both above texts 
const groupUnitID = "groupUnitDisplay"

//////////////////////////////////////
// Do not change any of the code below
//////////////////////////////////////

import wixData from 'wix-data';
import { local } from "wix-storage";
import { getWixFormData } from 'backend/wixForm.jsw';

let currentProgress = 0
let rowProgressBarCollection = null

$w.onReady(async function () {
    await renderingProgressbar();

    // This function will return you the total of paid amounts 
    const res = await getWixFormData(collectionID);

    if (res != undefined && rowProgressBarCollection != null) {
        currentProgress = res + rowProgressBarCollection.offlinePayment
    }

    if (currentProgress && currentProgress >= 0) {
        updateProgressBarCollection(currentProgress);
    }

    $w(`#${donationFormID}`).onSubmitSuccess(() => {
        const obj = {
            collectionID,
            title
        }
        local.setItem("progressBarObj", JSON.stringify(obj))
        local.setItem("progressBarType", "single")
    });

    local.setItem("progressBarObj", JSON.stringify({
        collectionID,
        title
    }))
    local.setItem("progressBarType", "single")
});

async function updateProgressBarCollection(currentProgress) {
    if (!rowProgressBarCollection) {
        console.error("rowProgressBarCollection is not initialized");
        return;
    }

    $w(`#${amountCollectedID}`).text = "£" + formatAndTruncate(currentProgress, 2)
    $w(`#${amountTarget}`).text = "£" + formatAndTruncate(rowProgressBarCollection.text, 2)
    let remaining = 0
    if (rowProgressBarCollection.text > currentProgress) {
        remaining = rowProgressBarCollection.text - currentProgress
    }
    $w(`#${amountRemaining}`).text = "£" + formatAndTruncate(remaining, 2)

    if (rowProgressBarCollection.progress != currentProgress - rowProgressBarCollection.offlinePayment) {
        $w(`#${progressBarID}`).value = currentProgress;
        try {
            rowProgressBarCollection = await wixData.update("Progressbar", {
                ...rowProgressBarCollection,
                progress: currentProgress - rowProgressBarCollection.offlinePayment
            });

            updateGroupUnitDisplay()
        } catch (error) {
            console.error("Error while updating progress:", error);
        }
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
        const response = await wixData.query("Progressbar").eq("title", title).find();
        if (response.items.length > 0) {
            rowProgressBarCollection = response.items[0]

            $w(`#${progressBarID}`).value = rowProgressBarCollection.progress + rowProgressBarCollection.offlinePayment; // initial progress
            $w(`#${progressBarID}`).targetValue = rowProgressBarCollection.text; // goal

            updateGroupUnitDisplay()
        } else {
            console.log("Result not found in ProgressBar collection")
            $w(`#${progressBarID}`).collapse()
        }
    } catch (error) {
        console.log("error :", error);
        $w(`#${progressBarID}`).collapse()
    }
}

function updateGroupUnitDisplay() {
    try {

        if (!groupUnitID || !unitsRaisedTillNowID || !unitsToRaiseTargetID) {
            console.log("IDs not found")
            $w(`#${groupUnitID}`).collapse()
            return;
        }

        if (!rowProgressBarCollection.amountPerUnit) {
            console.log("amountPerUnit not found")
            $w(`#${groupUnitID}`).collapse()
            return;
        }

        const unitAmount = rowProgressBarCollection.amountPerUnit
        const goal = rowProgressBarCollection.text
        const progress = rowProgressBarCollection.progress + rowProgressBarCollection.offlinePayment
        const raisedTillNow = progress / unitAmount
        const targetToRaise = goal / unitAmount

        $w(`#${unitsRaisedTillNowID}`).text = raisedTillNow.toFixed(0)
        $w(`#${unitsToRaiseTargetID}`).text = targetToRaise.toFixed(0)

        let numberRemaining = 0
        if (targetToRaise - raisedTillNow > 0) {
            numberRemaining = targetToRaise - raisedTillNow
        }

        $w(`#${unitsRemainingToRaise}`).text = numberRemaining.toFixed(0)

        $w(`#${groupUnitID}`).expand()

    } catch (e) {
        console.log(e)
    }
}