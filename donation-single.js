// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// import { generateNightlyCharges30nights } from "backend/calculate30nights"
// import { generateNightlyCharges10nights } from "backend/calculate10nights"
import { createProduct, createOneTimePrice, createCheckoutSessionForSinglePayment } from 'backend/stripeIntegration';
import { createCheckoutSessionForNewOrExistingCustomer } from 'backend/stripeIntegration';
import wixLocationFrontend from 'wix-location-frontend';
import { local } from 'wix-storage-frontend';
import wixLocation from 'wix-location';
import wixWindowFrontend from 'wix-window-frontend';
import wixData from 'wix-data';

let formFactor = wixWindowFrontend.formFactor;

let thirtiethNight = false;
let zakatCalculated = null

let donationSummaryArray = []

$w('#donationSummaryContainerS1').collapse()
$w('#donationSummaryContainerS2').collapse()
$w('#donationSummaryContainerS3').collapse()
$w('#donationSummaryContainerS4').collapse()

$w.onReady(function () {

    local.setItem("dbPlan", "zakaat")

    // $w("#buttons1").style.color = "#C4AB64"
    // $w("#buttons2").style.color = "white"
    // $w("#buttons1").onClick(() => {
    //     initializeState1()
    // })

    // $w("#buttons2").onClick(() => {
    //     $w("#statebox8").changeState("State4")
    //     $w("#buttons1").style.color = "white"
    //     $w("#buttons2").style.color = "#C4AB64"
    // })
    $w("#buttonSplit").onClick(() => {
        initializeState2()

        scrolltotop()

    })
    $w("#buttonSingle").onClick(() => {
        const total = $w('#textTotals1').text
        initializeState4(total)
        scrolltotop()

    })
    $w("#buttonFinalizeSplit").onClick(() => {
        initializeState3()
        scrolltotop()
    })


    calculateTotal()
    handleAddDonationButtons()

    $w('#dropdownGeneralProjects').disable()
    $w('#dropdownSawabProjects').disable()
    $w('#dropdownPopularProjects').disable()
    $w('#dropdownDonationTyped2').disable()
    $w('#dropdownDonationTyped3').disable()
    $w('#dropdownDonationTyped4').disable()

    wixData.query('ProjectsCollection')
        .find()
        .then(res => {
            // Sort items based on priority before filtering
            const sortedItems = res.items.sort((a, b) => a.priority - b.priority);

            const optionsGeneralItems = sortedItems.filter((item) => {
                    if (item.type) {
                        return item.type.indexOf("General Projects") != -1
                    } else {
                        return false
                    }
                })
                .map(item => {
                    return { label: item.title, value: `${item.price}-${item.title}` };
                });

            const optionsGeneralItemType = sortedItems.filter((item) => {
                if (item.type) {
                    return item.type.indexOf("General Projects") != -1
                } else {
                    return false
                }
            }).map((i) => {
                return { title: i.title, donationType: i.donationType }
            });

            const optionsPopularChoice = sortedItems.filter((item) => {
                    if (item.type) {
                        return item.type.indexOf("Popular Choice") != -1
                    } else {
                        return false
                    }
                })
                .map(item => {
                    return { label: item.title, value: `${item.price}-${item.title}` };
                });

            const optionsPopularItemType = sortedItems.filter((item) => {
                if (item.type) {
                    return item.type.indexOf("Popular Choice") != -1
                } else {
                    return false
                }
            }).map((i) => {
                return { title: i.title, donationType: i.donationType }
            });

            const optionsSawaabJaariyah = sortedItems.filter((item) => {
                    if (item.type) {
                        return item.type.indexOf("Sawaab-e-Jaariyah Projects") != -1
                    } else {
                        return false
                    }
                })
                .map(item => {
                    return { label: item.title, value: item.price.toString() };
                });

            const optionsSadaqahJaariyahItemType = sortedItems.filter((item) => {
                if (item.type) {
                    return item.type.indexOf("Sawaab-e-Jaariyah Projects") != -1
                } else {
                    return false
                }
            }).map((i) => {
                return { title: i.title, donationType: i.donationType }
            });

            $w('#dropdownGeneralProjects').options = optionsGeneralItems;
            $w('#dropdownGeneralProjects').selectedIndex = 0
            $w('#dropdownGeneralProjects').enable()
            $w('#dropdownGeneralProjects').onChange(() => updateGeneralProjects(optionsGeneralItemType, true))
            $w('#inputQuantityd2').onInput(() => updateGeneralProjects(optionsGeneralItemType, false))
            updateGeneralProjects(optionsGeneralItemType, true)

            $w('#dropdownPopularProjects').options = optionsPopularChoice;
            $w('#dropdownPopularProjects').selectedIndex = 0
            $w('#dropdownPopularProjects').enable()
            $w('#dropdownPopularProjects').onChange(() => updatePopularProjects(optionsPopularItemType, true))
            $w('#inputQuantityd3').onInput(() => updatePopularProjects(optionsPopularItemType, false))
            updatePopularProjects(optionsPopularItemType, true)

            $w('#dropdownSawabProjects').options = optionsSawaabJaariyah;
            $w('#dropdownSawabProjects').selectedIndex = 0
            $w('#dropdownSawabProjects').enable()

            $w('#dropdownSawabProjects').onChange(() => updateSawaabJaariyahProjects(optionsSadaqahJaariyahItemType, true))
            $w('#inputQuantityd4').onInput(() => updateSawaabJaariyahProjects(optionsSadaqahJaariyahItemType, false))
            updateSawaabJaariyahProjects(optionsSadaqahJaariyahItemType, true)
        })
        .catch(err => {
            $w('#dropdownGeneralProjects').disable()
            $w('#dropdownSawabProjects').disable()
            $w('#dropdownPopularProjects').disable()
            console.error(err);
        });

    function updateGeneralProjects(optionsGeneralItemType, setDonationTypeDropdown) {

        const projectPrice = Number($w('#dropdownGeneralProjects').value.split("-")[0])
        const quantity = Number($w('#inputQuantityd2').value)

        const totalAmount = projectPrice * quantity
        $w('#inputAmountd2').value = totalAmount.toFixed(2)

        if (setDonationTypeDropdown) {

            const selectedIndex = $w("#dropdownGeneralProjects").selectedIndex;
            const selectedValue = $w("#dropdownGeneralProjects").options[selectedIndex].label;

            const optionsSelectedProject = optionsGeneralItemType.find((item) => {
                if (item.title == selectedValue) {
                    return true
                } else {
                    return false
                }
            }).donationType.map(item => {
                return { label: item, value: item };
            });

            console.log("optionsSelectedProject")
            console.log(optionsSelectedProject)
            $w('#dropdownDonationTyped2').options = optionsSelectedProject
            $w('#dropdownDonationTyped2').selectedIndex = 0
            $w('#dropdownDonationTyped2').enable()

        }
    }

    function updatePopularProjects(optionsPopularItemType, setDonationTypeDropdown) {

        const projectPrice = Number($w('#dropdownPopularProjects').value.split("-")[0])
        const quantity = Number($w('#inputQuantityd3').value)

        const totalAmount = projectPrice * quantity
        $w('#inputAmountd3').value = totalAmount.toFixed(2)

        if (setDonationTypeDropdown) {

            const selectedIndex = $w("#dropdownPopularProjects").selectedIndex;
            const selectedValue = $w("#dropdownPopularProjects").options[selectedIndex].label;

            const optionsSelectedProject = optionsPopularItemType.find((item) => {
                if (item.title == selectedValue) {
                    return true
                } else {
                    return false
                }
            }).donationType.map(item => {
                return { label: item, value: item };
            });
            $w('#dropdownDonationTyped3').options = optionsSelectedProject
            $w('#dropdownDonationTyped3').selectedIndex = 0
            $w('#dropdownDonationTyped3').enable()
        }
    }

    function updateSawaabJaariyahProjects(optionsSadaqahJaariyahItemType, setDonationTypeDropdown) {

        const projectPrice = Number($w('#dropdownSawabProjects').value.split("-")[0])
        const quantity = Number($w('#inputQuantityd4').value)

        const totalAmount = projectPrice * quantity
        $w('#inputAmountd4').value = totalAmount.toFixed(2)

        if (setDonationTypeDropdown) {
            const selectedIndex = $w("#dropdownSawabProjects").selectedIndex;
            const selectedValue = $w("#dropdownSawabProjects").options[selectedIndex].label;

            const optionsSelectedProject = optionsSadaqahJaariyahItemType.find((item) => {
                if (item.title == selectedValue) {
                    return true
                } else {
                    return false
                }
            }).donationType.map(item => {
                return { label: item, value: item };
            });
            $w('#dropdownDonationTyped4').options = optionsSelectedProject
            $w('#dropdownDonationTyped4').selectedIndex = 0
            $w('#dropdownDonationTyped4').enable()
        }
    }
});

async function distributionResult() {

    const total = calculateTotal()
    let startDate = ""
    let distribution = ""

    const value = $w('#radioGroup1').value
    if (value.includes("10")) {
        startDate = '2024-03-10'
    } else if (value.includes("11")) {
        startDate = '2024-03-11'
    }

    const splitDropdownIndex = $w('#radioGroup2').selectedIndex
    if (splitDropdownIndex == 0) {
        distribution = 'evenly'
    } else if (splitDropdownIndex == 1) {
        const subDropdownIndex = $w('#dropdown2').selectedIndex
        if (subDropdownIndex == 0) {
            distribution = '1.5 times on odd nights'
        } else if (subDropdownIndex == 1) {
            distribution = '2 times on odd nights'
        } else if (subDropdownIndex == 2) {
            distribution = '3 times on odd nights'
        }
    } else if (splitDropdownIndex == 2) {
        const subDropdownIndex = $w('#dropdown3').selectedIndex
        if (subDropdownIndex == 0) {
            distribution = '1.5 times on 27th night'
        } else if (subDropdownIndex == 1) {
            distribution = '2 times on 27th night'
        } else if (subDropdownIndex == 2) {
            distribution = '3 times on 27th night'
        }
    }

    let tempStartDate = ""
    if (startDate == "2024-03-10") {
        tempStartDate = '2024-03-30'
    } else if (startDate == "2024-03-11") {
        tempStartDate = '2024-03-31'
    }

    console.log(`generateNightlyCharges30nights(${total}, ${startDate}, ${distribution})`)
    const result = []
    // const result = await generateNightlyCharges10nights(total, tempStartDate, distribution)
    // const result = await generateNightlyCharges30nights(total, startDate, distribution)
    console.log("result: ")
    console.log(result)

    // const firstNightItem = result.find(item => item.night === "1ST NIGHT");
    const firstNightItem = result[0]
    // Create a deep copy of the first night's item
    const firstNightItemCopy = JSON.parse(JSON.stringify(firstNightItem));
    const lastNightItem = result[result.length - 1]
    const lastNightItemCopy = JSON.parse(JSON.stringify(lastNightItem));
    $w('#text124').text = `If Ramadan lasts 30 nights you will be charged a further £${firstNightItemCopy.amount} on the last night.`

    $w('#text114').text = "First Payment " + firstNightItemCopy.dueDate
    if (thirtiethNight) {
        if (firstNightItem) {

            // Update the night and dueDate for the 30th night
            firstNightItemCopy.night = '30TH NIGHT';

            // Assuming dueDate is in 'DD/MM/YYYY' format
            const dateParts = lastNightItemCopy.dueDate.split('/');

            // Now it is in 'YYYY-MM-DD' format
            const dateInFormat = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0]

            const firstNightDate = new Date(dateInFormat);
            firstNightDate.setDate(firstNightDate.getDate() + 1); // Its actually last night so +1

            // // Assuming dueDate is in 'DD/MM/YYYY' format
            // const dateParts = firstNightItemCopy.dueDate.split('/');

            // // Now it is in 'YYYY-MM-DD' format
            // const dateInFormat = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0]

            // const firstNightDate = new Date(dateInFormat);

            // firstNightDate.setDate(firstNightDate.getDate() + 29); // Add 29 days to the first night's date

            // Convert back to 'DD/MM/YYYY' format for the due date
            const dueDate =
                ("0" + firstNightDate.getDate()).slice(-2) + '/' + // Day
                ("0" + (firstNightDate.getMonth() + 1)).slice(-2) + '/' + // Month
                firstNightDate.getFullYear(); // Year

            firstNightItemCopy.dueDate = dueDate;

            result.push(firstNightItemCopy);

            calculateTotals2(firstNightItemCopy.amount)
        }
    }

    const resultWithIdsForRepeator = result.map((item, index) => {
        return {
            ...item, // Spread the existing properties
            _id: index.toString(), // Add a unique _id property, converting index to string
            amount: item.amount
        };
    });

    const resultWithIds = result.map((item, index) => {
        return {
            ...item, // Spread the existing properties
            _id: index.toString(), // Add a unique _id property, converting index to string
        };
    });

    // show in repeater
    $w('#repeater7').expand()
    $w('#repeater7').data = resultWithIdsForRepeator

    $w("#repeater7").onItemReady(($item, itemData, index) => {
        // Assuming you have text elements with the IDs textNight, textAmount, and textDueDate inside the repeater
        $item("#textNight").text = itemData.night.split(' ').map(function (word) {
            return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
        }).join(' ');
        $item("#textPrice").text = "£" + itemData.amount.toFixed(2); // Set the amount, converting it to string if necessary
        $item("#textDate").text = itemData.dueDate; // Set the due date
    });

    return resultWithIds
}

function calculateTotal() {

    // let total = 0;
    let total = 0;
    donationSummaryArray.forEach((item) => {
        total += item.value
    })
    // if (!$w('#boxd1').collapsed) {
    //     total += Number($w('#inputd1').value)
    // }
    // if (!$w('#boxd2').collapsed) {
    //     total += Number($w('#inputd2').value)
    // }
    // if (!$w('#boxd3').collapsed) {
    //     total += Number($w('#inputd3').value)
    // }
    // if (!$w('#boxd4').collapsed) {
    //     total += Number($w('#inputd4').value)
    // }
    if ($w('#checkboxAdminFee').checked || $w('#checkboxAdminFee2').checked) {
        total += 1
        $w('#textTotals1').text = `£${total.toFixed(2)}`
        $w('#textTotals2').text = `£${total.toFixed(2)}`
        $w('#textTotals3').text = `£${total.toFixed(2)}`
        $w('#textTotals4').text = `£${total.toFixed(2)}`
    } else {
        $w('#textTotals1').text = `£${total.toFixed(2)}`
        $w('#textTotals2').text = `£${total.toFixed(2)}`
        $w('#textTotals3').text = `£${total.toFixed(2)}`
        $w('#textTotals4').text = `£${total.toFixed(2)}`
    }

    if (total > 0) {
        // $w("#buttons2").enable()
        $w("#buttonSingle").enable()
        $w("#buttonSplit").enable()
        $w("#buttonFinalizeSplit").enable()
    } else {
        // $w("#buttons2").disable()
        $w("#buttonSingle").disable()
        $w("#buttonSplit").disable()
        $w("#buttonFinalizeSplit").disable()
    }
    return total
}

function calculateTotals1() {
    checkAdminCharges()
    const total = calculateTotal()
}

function calculateTotals2(extraAmount = null) {
    const recTotal = calculateTotal()
    if ($w('#checkboxAdminFee').checked || $w('#checkboxAdminFee2').checked) {
        $w('#textTotals2r').text = `£${(recTotal-1).toFixed(2)}`
    } else {
        $w('#textTotals2r').text = `£${recTotal.toFixed(2)}`
    }

    const index = $w('#dropdown1').selectedIndex

    let extra = 0
    if (index == 1) {
        if (extraAmount) {
            extra = extraAmount
        } else {
            extra = Number((recTotal / 29).toFixed(2))
        }
    }
    console.log("extra: " + extra)

    const total = recTotal + extra;
    $w('#text120').text = `£${extra.toFixed(2)}`
    $w('#textTotals2').text = `£${total.toFixed(2)}`
}

function initializeState1() {
    // $w('#box28').expand()
    $w("#statebox8").changeState("State1")
    // $w("#buttons1").style.color = "#C4AB64"
    // $w("#buttons2").style.color = "white"
    calculateTotals1()
}

function initializeState2() {
    // $w('#box28').expand()
    $w("#statebox8").changeState("State2")
    // $w("#buttons1").style.color = "white"
    // $w("#buttons2").style.color = "#C4AB64"
    $w('#boxs2splitEqually').expand()
    $w('#dropdown1').selectedIndex = 0
    calculateTotals2()
    showSplitText()

    $w('#dropdown2').collapse()
    $w('#dropdown3').collapse()

    $w('#radioGroup1').onChange(() => {
        const value = $w('#radioGroup1').value
        if (value.includes("10")) {
            showSplitText()

            // $w('#text118').text = "Payment for the 30th night (if 10th is first)"
            $w('#text118').text = ""
            $w('#text117').text = "Apr 8, 2024"
        } else if (value.includes("11")) {
            showSplitText()

            // $w('#text118').text = "Payment for the 30th night (if 11th is first)"
            $w('#text118').text = ""
            $w('#text117').text = "Apr 9, 2024"
        }
    })

    $w('#dropdown1').onChange(() => {
        const index = $w('#dropdown1').selectedIndex

        if (index == 0) {
            $w('#boxExtraFor30th').collapse()
            thirtiethNight = false
        } else if (index == 1) {
            $w('#boxExtraFor30th').expand()
            const value = $w('#radioGroup1').value
            if (value.includes("10")) {
                // $w('#text118').text = "Payment for the 30th night (if 10th is first)"
                $w('#text118').text = ""
                $w('#text117').text = "Apr 8, 2024"
            } else if (value.includes("11")) {
                // $w('#text118').text = "Payment for the 30th night (if 11th is first)"
                $w('#text118').text = ""
                $w('#text117').text = "Apr 9, 2024"
            }
            thirtiethNight = true
        }
        calculateTotals2()
        distributionResult()
    })

    $w('#radioGroup2').onChange(() => {
        const index = $w('#radioGroup2').selectedIndex
        if (index == 0) {
            $w('#dropdown2').collapse()
            $w('#dropdown3').collapse()
        } else if (index == 1) {
            $w('#dropdown2').expand()
            $w('#dropdown2').selectedIndex = 0
            $w('#dropdown3').collapse()
        } else if (index == 2) {
            $w('#dropdown2').collapse()
            $w('#dropdown3').expand()
            $w('#dropdown3').selectedIndex = 0
        }
        showSplitText()
    })

}

async function initializeState3() {
    $w("#statebox8").changeState("State3")
    // $w("#buttons1").style.color = "white"
    // $w("#buttons2").style.color = "white"
    // $w('#box28').collapse()

    const finalSplitgPayment = await distributionResult()

    // const paymentsString = finalSplitgPayment.map(payment => `£${payment.amount.toFixed(2)}`).join(", ");

    let total = 0
    finalSplitgPayment.forEach((obj) => {
        total += obj.amount
    })
    total = Number(total.toFixed(2))

    // $w('#text98').text = "Recurring payment: £" + total
    // $w('#text132').text = "£" + total
    $w('#textTotals3').text = "£" + total.toFixed(2)

    $w('#checkouts3').disable()

    $w('#inputFirstName').onChange(shouldCheckout)
    $w('#inputLastName').onChange(shouldCheckout)
    $w('#inputPhone').onChange(shouldCheckout)
    $w('#inputAddress').onChange(shouldCheckout)
    $w('#inputCity').onChange(shouldCheckout)
    $w('#inputZipcode').onChange(shouldCheckout)
    $w('#inputEmail').onChange(shouldCheckout)

    // Stripe Recurring payment
    $w('#checkouts3').onClick(() => {
        scrolltotop()

        if (shouldCheckout) {
            // Collect customer details
            let customerDetails = {
                firstName: $w('#inputFirstName').value,
                lastName: $w('#inputLastName').value,
                phone: $w('#inputPhone').value,
                address: $w('#inputAddress').value,
                city: $w('#inputCity').value,
                zipCode: $w('#inputZipcode').value,
                email: $w('#inputEmail').value,
                check_increaseby25: $w('#checkbox1').checked,
                check_consent: $w('#checkbox2').checked,
                check_adminCharges: $w('#checkboxAdminFee').checked,
                plan: "Zakaat Single Payment"
            };

            // Store the customer details in local storage
            local.setItem("customerDetails", JSON.stringify(customerDetails));

            const email = $w('#inputEmail').value;
            handleRecurringPayment(email, finalSplitgPayment)
        } else {
            console.log("Form is not filled correctly")
        }
    })
}

function shouldCheckout() {

    // Validate the email address
    let emailOkay = validateEmail($w('#inputEmail').value) !== null;

    // Check that all other fields are not empty
    let firstNameOkay = $w('#inputFirstName').value.trim() !== '';
    let lastNameOkay = $w('#inputLastName').value.trim() !== '';
    let phoneOkay = $w('#inputPhone').value.trim() !== '';
    let addressOkay = $w('#inputAddress').value.trim() !== '';
    let cityOkay = $w('#inputCity').value.trim() !== '';
    let zipcodeOkay = $w('#inputZipcode').value.trim() !== '';

    // Determine if all conditions are okay
    let allOkay = emailOkay && firstNameOkay && lastNameOkay && phoneOkay && addressOkay && cityOkay && zipcodeOkay;

    if (allOkay) {
        $w('#checkouts3').enable()
        return true
    } else {
        $w('#checkouts3').disable()
        return false
    }
}

function initializeState4(finalPayment) {
    $w("#statebox8").changeState("State4")
    // $w("#buttons1").style.color = "white"
    // $w("#buttons2").style.color = "#C4AB64"
    // $w('#box28').collapse()

    if (finalPayment) {

        // const finalSinglePayment = Number(finalPayment.substring(1)) || null;
        // $w('#text137').text = finalPayment

        $w('#textTotals4').text = finalPayment

        // Stripe single payment

        $w('#checkouts4').disable()

        console.log("present2")

        $w('#inputFirstNameSingle').onInput(shouldCheckoutSingle)
        $w('#inputLastNameSingle').onInput(shouldCheckoutSingle)
        $w('#inputPhoneSingle').onInput(shouldCheckoutSingle)
        $w('#inputAddressSingle').onInput(shouldCheckoutSingle)
        $w('#inputCitySingle').onInput(shouldCheckoutSingle)
        $w('#inputZipcodeSingle').onInput(shouldCheckoutSingle)
        $w('#inputEmailSingle').onInput(shouldCheckoutSingle)

        // Stripe Recurring payment
        $w('#checkouts4').onClick(() => {
            scrolltotop()
            const finalSinglePayment = calculateTotal()

            console.log("hiiii")
            if (shouldCheckoutSingle) {
                // Collect customer details
                let customerDetails = {
                    firstName: $w('#inputFirstNameSingle').value,
                    lastName: $w('#inputLastNameSingle').value,
                    phone: $w('#inputPhoneSingle').value,
                    address: $w('#inputAddressSingle').value,
                    city: $w('#inputCitySingle').value,
                    zipCode: $w('#inputZipcodeSingle').value,
                    email: $w('#inputEmailSingle').value,
                    check_increaseby25: $w('#checkbox1Single').checked,
                    check_consent: $w('#checkbox2Single').checked,
                    check_adminCharges: $w('#checkboxAdminFee2').checked,
                    plan: "Zakaat Single Payment"
                };

                // Store the customer details in local storage
                local.setItem("customerDetails", JSON.stringify(customerDetails));

                const email = $w('#inputEmail').value;
                handleSinglePayment(email, finalSinglePayment)
            } else {
                console.log("Form is not filled correctly")
            }
        })

    } else {
        console.log("Final payment not present")
    }
}

function shouldCheckoutSingle() {

    // Validate the email address
    let emailOkay = validateEmail($w('#inputEmailSingle').value);

    // Check that all other fields are not empty
    let firstNameOkay = $w('#inputFirstNameSingle').value.trim() !== '';
    let lastNameOkay = $w('#inputLastNameSingle').value.trim() !== '';
    let phoneOkay = $w('#inputPhoneSingle').value.trim() !== '';
    let addressOkay = $w('#inputAddressSingle').value.trim() !== '';
    let cityOkay = $w('#inputCitySingle').value.trim() !== '';
    let zipcodeOkay = $w('#inputZipcodeSingle').value.trim() !== '';

    // Determine if all conditions are okay
    let allOkay = emailOkay && firstNameOkay && lastNameOkay && phoneOkay && addressOkay && cityOkay && zipcodeOkay;

    if (allOkay) {
        $w('#checkouts4').enable()
        return true
    } else {
        $w('#checkouts4').disable()
        return false
    }
}

function validateEmail(email) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
}

$w('#dropdown2').onChange(() => {
    showSplitText()
})
$w('#dropdown3').onChange(() => {
    showSplitText()
})

function showSplitText() {
    const dateRadioValue = $w('#radioGroup1').value
    let dateText = ""
    let splitText = ""

    if (dateRadioValue.includes("10")) {
        // dateText = "(10th - 30 nights)"
        dateText = ""
        // $w('#text114').text = "First Payment Mar 10, 2024"
    } else if (dateRadioValue.includes("11")) {
        // dateText = "(11th - 30 nights)"
        dateText = ""
        // $w('#text114').text = "First Payment Mar 11, 2024"
    }

    const splitDropdownIndex = $w('#radioGroup2').selectedIndex
    if (splitDropdownIndex == 0) {
        splitText = "Split Equally"
    } else if (splitDropdownIndex == 1) {
        const subDropdownIndex = $w('#dropdown2').selectedIndex
        if (subDropdownIndex == 0) {
            splitText = "1.5 Times on odd nights"
        } else if (subDropdownIndex == 1) {
            splitText = "2 Times on odd nights"
        } else if (subDropdownIndex == 2) {
            splitText = "3 Times on odd nights"
        }
    } else if (splitDropdownIndex == 2) {
        const subDropdownIndex = $w('#dropdown3').selectedIndex
        if (subDropdownIndex == 0) {
            splitText = "1.5 Times on 27th night"
        } else if (subDropdownIndex == 1) {
            splitText = "2 Times on 27th night"
        } else if (subDropdownIndex == 2) {
            splitText = "3 Times on 27th night"
        }
    }
    $w('#text113').text = `${splitText} ${dateText}`

    distributionResult()
}

function restrictToPositiveNumbers(inputFieldId) {
    $w(inputFieldId).onInput((event) => {
        let currentValue = $w(inputFieldId).value;
        // Remove anything that is not a digit
        let cleanedValue = currentValue.replace(/[^0-9]/g, '');
        // Update the input field's value only if it needs to be cleaned
        if (currentValue !== cleanedValue) {
            $w(inputFieldId).value = cleanedValue;
        }
    });
}

function ensurePositiveNumbersWithDecimal(inputFieldId) {
    $w.onReady(function () {
        $w(inputFieldId).onInput((event) => {
            let currentValue = $w(inputFieldId).value;
            // First, ensure only one decimal point is present
            let decimalCount = (currentValue.match(/\./g) || []).length;
            while (decimalCount > 1) {
                // Remove the last decimal point if more than one
                currentValue = currentValue.substring(0, currentValue.lastIndexOf('.')) + currentValue.substring(currentValue.lastIndexOf('.') + 1);
                decimalCount--;
            }
            // Now, remove anything that is not a digit or decimal point
            let cleanedValue = currentValue.replace(/[^0-9.]/g, '');
            // Update the input field's value only if it needs to be cleaned
            if (currentValue !== cleanedValue) {
                $w(inputFieldId).value = cleanedValue;
            }
        });
    });
}

function handleAddDonationButtons() {

    ensurePositiveNumbersWithDecimal("#inputd1");
    restrictToPositiveNumbers("#inputQuantityd2");
    restrictToPositiveNumbers("#inputQuantityd3");
    restrictToPositiveNumbers("#inputQuantityd4");

    if (zakatCalculated) {
        $w('#inputd1').value = zakatCalculated

        calculateTotals1()
    }

    $w('#buttonBackState2').onClick(() => {
        $w("#statebox8").changeState("State1")
        // $w("#buttons1").style.color = "#C4AB64"
        // $w("#buttons2").style.color = "white"
    })
    $w('#buttonBackState3').onClick(() => {
        $w("#statebox8").changeState("State2")
    })
    $w('#buttonBackState4').onClick(() => {
        $w("#statebox8").changeState("State1")
        // $w("#buttons1").style.color = "#C4AB64"
        // $w("#buttons2").style.color = "white"
    })

    $w('#buttonClosed1').onClick(() => {

        for (const obj of donationSummaryArray) {
            if (obj._id == "MostInNeedZakat") {
                obj.value = 0
            }
        }

        updateSummaryRepeater()

        calculateTotals1()

        $w('#groupMostInNeed').collapse()

    })

    let queryParams = wixLocation.query;
    if ("zakatCalculated" in queryParams) {
        // zakatCalculated = queryParams.zakatCalculated;
        zakatCalculated = (Number(queryParams.zakatCalculated));
        if (zakatCalculated > 0) {
            $w('#inputd1').value = zakatCalculated.toString()
            buttond1Click()
        }
    }

    $w("#buttond1").onClick(buttond1Click)

    function buttond1Click() {

        let value = Number($w('#inputd1').value)
        const donationType = $w('#donationTyped1').value

        // new repeater code
        let newObj = {
            _id: "MostInNeedZakat",
            title: "Most in Need Zakat",
            name: "Most in Need Zakat",
            value: value,
            donationType: donationType,
            quantity: 1,
        }
        let objExists = false
        for (const obj of donationSummaryArray) {
            if (obj._id == "MostInNeedZakat") {
                obj.value = value
                objExists = true
            }
        }
        if (!objExists) {
            donationSummaryArray.push(newObj)
        }

        updateSummaryRepeater()

        calculateTotals1()

        for (const obj of donationSummaryArray) {
            if (obj._id == "MostInNeedZakat") {
                $w('#textTitled1').text = obj.title
                $w('#textPriced1').text = "£" + obj.value.toFixed(2)
                objExists = true
            }
        }
        if (!objExists) {
            $w('#groupMostInNeed').collapse()
        } else {
            if (value == 0) {
                $w('#groupMostInNeed').collapse()
            } else {
                $w('#groupMostInNeed').expand()
            }
        }

        console.log("donationSummaryArray")
        console.log(donationSummaryArray)
    }

    $w("#buttond2").onClick(() => {
        const value = Number($w('#inputAmountd2').value)

        const selectedIndex = $w("#dropdownGeneralProjects").selectedIndex;
        const label = $w("#dropdownGeneralProjects").options[selectedIndex].label;

        const unitPrice = Number($w('#dropdownGeneralProjects').value.split("-")[0])
        // const unitPrice = Number($w('#dropdownGeneralProjects').value)
        const quantity = Number($w('#inputQuantityd2').value)
        $w('#inputQuantityd2').value = "1"

        const donationType = $w('#dropdownDonationTyped2').value

        // new repeater code
        let newObj = {
            // _id: label.replace(/\s+/g, ''),
            _id: "generalProjects" + selectedIndex,
            title: "General Projects",
            name: label,
            value: value,
            unitPrice: unitPrice,
            quantity: quantity,
            donationType: donationType
        }

        let objExists = false
        for (const obj of donationSummaryArray) {
            // if (obj._id == label.replace(/\s+/g, '')) {
            if (obj._id == "generalProjects" + selectedIndex) {
                obj.value = value
                obj.quantity = quantity
                obj.donationType = donationType

                objExists = true
            }
        }
        if (!objExists) {
            donationSummaryArray.push(newObj)
        }

        const generalProjects = donationSummaryArray.filter(function (item) {
            return item.title == "General Projects";
        });

        if (generalProjects.length > 0) {
            $w("#repeaterGeneral").data = generalProjects;

            $w("#repeaterGeneral").onItemReady(($item, itemData, index) => {
                $item("#textTitleGeneral").text = itemData.name;
                $item("#textPriceGeneralEach").text = `£${itemData.unitPrice} Each`
                $item("#textPriceGeneral").text = `£${itemData.value.toFixed(2)}`
                $item('#buttonDeleteItem').onClick(() => {
                    donationSummaryArray = donationSummaryArray.filter(function (item) {
                        return item.name !== itemData.name;
                    });
                    const generalProjects = donationSummaryArray.filter(function (item) {
                        return item.title == "General Projects";
                    });

                    $w("#repeaterGeneral").data = generalProjects;

                    updateSummaryRepeater()

                    calculateTotals1()
                })

            });

            $w('#containerGeneral').expand()
        } else {
            $w('#containerGeneral').collapse()
        }

        updateSummaryRepeater()

        calculateTotals1()

        console.log("donationSummaryArray")
        console.log(donationSummaryArray)
    })

    $w("#buttond3").onClick(() => {
        const value = Number($w('#inputAmountd3').value)

        const selectedIndex = $w("#dropdownPopularProjects").selectedIndex;
        const label = $w("#dropdownPopularProjects").options[selectedIndex].label;

        const unitPrice = Number($w('#dropdownPopularProjects').value.split("-")[0])
        const quantity = Number($w('#inputQuantityd3').value)
        $w('#inputQuantityd3').value = "1"

        const donationType = $w('#dropdownDonationTyped3').value

        // new repeater code
        let newObj = {
            // _id: label.replace(/\s+/g, ''),
            _id: "popularProjects" + selectedIndex,
            title: "Popular Projects",
            name: label,
            value: value,
            unitPrice: unitPrice,
            quantity: quantity,
            donationType: donationType
        }

        let objExists = false
        for (const obj of donationSummaryArray) {
            // if (obj._id == label.replace(/\s+/g, '')) {
            if (obj._id == "popularProjects" + selectedIndex) {
                obj.value = value
                obj.quantity = quantity
                obj.donationType = donationType

                objExists = true
            }
        }
        if (!objExists) {
            donationSummaryArray.push(newObj)
        }

        const popularProjects = donationSummaryArray.filter(function (item) {
            return item.title == "Popular Projects";
        });

        if (popularProjects.length > 0) {
            $w("#repeaterPopular").data = popularProjects;

            $w("#repeaterPopular").onItemReady(($item, itemData, index) => {
                $item("#textTitlePopular").text = itemData.name;

                $item("#textTitlePopular").text = itemData.name;
                $item("#textPricePopularEach").text = `£${itemData.unitPrice} Each`
                $item("#textPricePopular").text = `£${itemData.value.toFixed(2)}`
                $item('#buttonDeleteItemPopular').onClick(() => {
                    donationSummaryArray = donationSummaryArray.filter(function (item) {
                        return item.name !== itemData.name;
                    });
                    const popularProjects = donationSummaryArray.filter(function (item) {
                        return item.title == "Popular Projects";
                    });

                    $w("#repeaterPopular").data = popularProjects;

                    updateSummaryRepeater()

                    calculateTotals1()
                })

            });
            $w('#containerPopular').expand()
        } else {
            $w('#containerPopular').collapse()
        }

        updateSummaryRepeater()

        calculateTotals1()

        console.log("donationSummaryArray")
        console.log(donationSummaryArray)
    })

    $w("#buttond4").onClick(() => {
        const value = Number($w('#inputAmountd4').value)

        const selectedIndex = $w("#dropdownSawabProjects").selectedIndex;
        const label = $w("#dropdownSawabProjects").options[selectedIndex].label;

        const unitPrice = Number($w('#dropdownSawabProjects').value.split("-")[0])
        const quantity = Number($w('#inputQuantityd4').value)
        $w('#inputQuantityd4').value = "1"
        const donationType = $w('#dropdownDonationTyped4').value

        // new repeater code
        let newObj = {
            // _id: label.replace(/\s+/g, ''),
            _id: "sawaabJaariyahProjects" + selectedIndex,
            title: "Sawaab-e-Jaariyah Projects",
            name: label,
            value: value,
            unitPrice: unitPrice,
            quantity: quantity,
            donationType: donationType
        }

        let objExists = false
        for (const obj of donationSummaryArray) {
            // if (obj._id == label.replace(/\s+/g, '')) {
            if (obj._id == "sawaabJaariyahProjects" + selectedIndex) {
                obj.value = value
                obj.quantity = quantity
                obj.donationType = donationType

                objExists = true
            }
        }
        if (!objExists) {
            donationSummaryArray.push(newObj)
        }

        const sawaabJaariyahProjects = donationSummaryArray.filter(function (item) {
            return item.title == "Sawaab-e-Jaariyah Projects";
        });

        if (sawaabJaariyahProjects.length > 0) {
            $w("#repeaterSawaabJaariyah").data = sawaabJaariyahProjects;

            $w("#repeaterSawaabJaariyah").onItemReady(($item, itemData, index) => {

                $item("#textTitleSawaabJaariyah").text = itemData.name;

                $item("#textTitleSawaabJaariyah").text = itemData.name;
                $item("#textPriceSawaabJaariyahEach").text = `£${itemData.unitPrice} Each`
                $item("#textPriceSawaabJaariyah").text = `£${itemData.value.toFixed(2)}`
                $item('#buttonDeleteItemSawaabJaariyah').onClick(() => {
                    donationSummaryArray = donationSummaryArray.filter(function (item) {
                        return item.name !== itemData.name;
                    });

                    const sawaabJaariyahProjects = donationSummaryArray.filter(function (item) {
                        return item.title == "Sawaab-e-Jaariyah Projects";
                    });

                    $w("#repeaterSawaabJaariyah").data = sawaabJaariyahProjects;

                    updateSummaryRepeater()

                    calculateTotals1()
                })

            });
            $w('#containerSawaabJaariyah').expand()
        } else {
            $w('#containerSawaabJaariyah').collapse()
        }

        updateSummaryRepeater()

        calculateTotals1()

        console.log("donationSummaryArray")
        console.log(donationSummaryArray)
    })
}

function updateSummaryRepeater() {
    donationSummaryArray = donationSummaryArray.filter(function (item) {
        return item.value !== 0;
    });
    if (donationSummaryArray.length > 0) {
        const donationSummaryArrayFinal = []

        let zakatObject = {}
        const zakatSum = donationSummaryArray.reduce((accumulator, current) => {
            if (current.title === "Most in Need Zakat") {
                zakatObject = { ...current }
                return accumulator + current.value;
            }
            return accumulator;
        }, 0);
        if (zakatSum > 0) {
            zakatObject.value = zakatSum
            donationSummaryArrayFinal.push(zakatObject)
        }

        let generalProjectsObject = {}
        const generalProjectsSum = donationSummaryArray.reduce((accumulator, current) => {
            if (current.title === "General Projects") {
                generalProjectsObject = { ...current }
                return accumulator + current.value;
            }
            return accumulator;
        }, 0);
        if (generalProjectsSum > 0) {
            generalProjectsObject.value = generalProjectsSum
            donationSummaryArrayFinal.push(generalProjectsObject)
        }

        let popularProjectsObject = {}
        const popularProjectsSum = donationSummaryArray.reduce((accumulator, current) => {
            if (current.title === "Popular Projects") {
                popularProjectsObject = { ...current }
                return accumulator + current.value;
            }
            return accumulator;
        }, 0);
        if (popularProjectsSum > 0) {
            popularProjectsObject.value = popularProjectsSum
            donationSummaryArrayFinal.push(popularProjectsObject)
        }

        let sawaabJaariyahProjectsObject = {}
        const sawaabJaariyahProjectsSum = donationSummaryArray.reduce((accumulator, current) => {
            if (current.title === "Sawaab-e-Jaariyah Projects") {
                sawaabJaariyahProjectsObject = { ...current }
                return accumulator + current.value;
            }
            return accumulator;
        }, 0);
        if (sawaabJaariyahProjectsSum > 0) {
            sawaabJaariyahProjectsObject.value = sawaabJaariyahProjectsSum
            donationSummaryArrayFinal.push(sawaabJaariyahProjectsObject)
        }

        ///
        let generalProjectsSubText = ""
        let popularProjectsSubText = ""
        let sawaabProjectsSubText = ""
        let donationAppeals = ""

        donationSummaryArray.forEach((item) => {
            if (item.title === "General Projects") {

                generalProjectsSubText += `${item.name}&nbsp;&nbsp; x ${item.quantity}<br/>`

            } else if (item.title === "Popular Projects") {

                popularProjectsSubText += `${item.name}&nbsp;&nbsp; x ${item.quantity}<br/>`

            } else if (item.title === "Sawaab-e-Jaariyah Projects") {

                sawaabProjectsSubText += `${item.name}&nbsp;&nbsp; x ${item.quantity}<br/>`

            }
            donationAppeals += `${item.name} x ${item.quantity} (${item.donationType}), `
        })
        donationAppeals = donationAppeals.replace(/,\s*$/, "");
        local.setItem('donationAppeals', donationAppeals);

        console.log("donationAppeals")
        console.log(donationAppeals)

        ///

        $w("#donationSummaryRepeaterS1").data = donationSummaryArrayFinal;
        // $w("#donationSummaryRepeaterS2").data = donationSummaryArrayFinal;
        // $w("#donationSummaryRepeaterS3").data = donationSummaryArrayFinal;
        $w("#donationSummaryRepeaterS4").data = donationSummaryArrayFinal;

        $w("#donationSummaryRepeaterS1").onItemReady(($item, itemData, index) => {
            $item("#donationSummaryRepeaterTitleS1").text = itemData.title;
            $item("#donationSummaryRepeaterPriceS1").text = "£" + itemData.value.toFixed(2);

            if (itemData.title == "General Projects") {
                $item("#donationSummarySubTextS1").html = `<p><small>${generalProjectsSubText}</small></p>`;

            } else if (itemData.title == "Popular Projects") {
                $item("#donationSummarySubTextS1").html = `<p><small>${popularProjectsSubText}</small></p>`;

            } else if (itemData.title == "Sawaab-e-Jaariyah Projects") {
                $item("#donationSummarySubTextS1").html = `<p><small>${sawaabProjectsSubText}</small></p>`;

            } else {
                $item("#donationSummarySubTextS1").html = "<></>";
            }
        });
        // $w("#donationSummaryRepeaterS2").onItemReady(($item, itemData, index) => {
        //     $item("#donationSummaryRepeaterTitleS2").text = itemData.title;
        //     $item("#donationSummaryRepeaterPriceS2").text = "£" + itemData.value.toFixed(2);
        // });
        // $w("#donationSummaryRepeaterS3").onItemReady(($item, itemData, index) => {
        //     $item("#donationSummaryRepeaterTitleS3").text = itemData.title;
        //     $item("#donationSummaryRepeaterPriceS3").text = "£" + itemData.value.toFixed(2);
        // });
        $w("#donationSummaryRepeaterS4").onItemReady(($item, itemData, index) => {
            $item("#donationSummaryRepeaterTitleS4").text = itemData.title;
            $item("#donationSummaryRepeaterPriceS4").text = "£" + itemData.value.toFixed(2);

            if (itemData.title == "General Projects") {
                $item("#donationSummarySubTextS4").html = `<p><small>${generalProjectsSubText}</small></p>`;

            } else if (itemData.title == "Popular Projects") {
                $item("#donationSummarySubTextS4").html = `<p><small>${popularProjectsSubText}</small></p>`;

            } else if (itemData.title == "Sawaab-e-Jaariyah Projects") {
                $item("#donationSummarySubTextS4").html = `<p><small>${sawaabProjectsSubText}</small></p>`;

            } else {
                $item("#donationSummarySubTextS4").html = "<></>";
            }
        });

        $w("#donationSummaryContainerS1").expand();
        $w("#donationSummaryContainerS2").expand();
        $w("#donationSummaryContainerS3").expand();
        $w("#donationSummaryContainerS4").expand();
    } else {
        $w("#donationSummaryContainerS1").collapse();
        $w("#donationSummaryContainerS2").collapse();
        $w("#donationSummaryContainerS3").collapse();
        $w("#donationSummaryContainerS4").collapse();
    }
}

function generateDescription() {
    let parts = [];
    // if (!$w('#boxd1').collapsed) {
    //     parts.push($w('#text89').text);
    // }
    // if (!$w('#boxd2').collapsed) {
    //     parts.push($w('#text93').text);
    // }
    // if (!$w('#boxd3').collapsed) {
    //     parts.push($w('#text95').text);
    // }
    // if (!$w('#boxd4').collapsed) {
    //     parts.push($w('#text97').text);
    // }

    const description = parts.join(", ");
    return description
}

$w('#checkboxAdminFee').onChange(() => {
    calculateTotals1()
})
$w('#checkboxAdminFee2').onChange(() => {
    calculateTotals1()
})

function checkAdminCharges() {
    if ($w('#checkboxAdminFee').checked || $w('#checkboxAdminFee2').checked) {
        // State 1
        $w('#boxd5').expand()
        // State 2
        $w('#boxs2d5').expand()
        // State 3
        $w('#box5s3').expand()
        // State 4
        $w('#box5s4').expand()
    } else {
        // State 1
        $w('#boxd5').collapse()
        // State 2
        $w('#boxs2d5').collapse()
        // State 3
        $w('#box5s3').collapse()
        // State 4
        $w('#box5s4').collapse()
    }
}

async function handleSinglePayment(email, finalSinglePayment) {

    // const description = generateDescription()
    const description = "Donation"
    local.setItem('customerEmail', email);

    const customerTotalPayment = calculateTotal()
    local.setItem('customerTotalPayment', customerTotalPayment);

    local.setItem('projectSelected', JSON.stringify(donationSummaryArray));

    try {
        const amountInPence = finalSinglePayment * 100; // Convert pounds to pence
        console.log("amountInPence")
        console.log(amountInPence)
        const oneTimeProduct = await createProduct("Donation", description)
        console.log("oneTimeProduct")
        console.log(oneTimeProduct)
        const addonsOneTimePrice = await createOneTimePrice(oneTimeProduct.id, amountInPence);
        console.log("addonsOneTimePrice")
        console.log(addonsOneTimePrice)

        const session = await createCheckoutSessionForSinglePayment(addonsOneTimePrice.id);
        console.log("Session URL: ", session.url);
        wixLocationFrontend.to(session.url);

    } catch (error) {
        console.error('Error calling stripe backend for payment:', error);
    }
}

async function handleRecurringPayment(email, finalSplitgPaymentArray) {

    const customerTotalPayment = calculateTotal()
    local.setItem('customerTotalPayment', customerTotalPayment);

    local.setItem('projectSelected', JSON.stringify(donationSummaryArray));

    try {
        local.setItem('finalSplitPaymentArray', JSON.stringify(finalSplitgPaymentArray));
        local.setItem('customerEmail', email);
        local.setItem("status", "pending")

        console.log("calling " + email)
        // Call your function to create a checkout session
        const session = await createCheckoutSessionForNewOrExistingCustomer(email);
        if (session.url) {
            wixLocationFrontend.to(session.url);
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Failed to handle recurring payment:', error);
        throw error; // Re-throw or handle it as per your error handling policy
    }

}

function scrolltotop() {

    if (formFactor != "Mobile") {
        //desktop
        wixWindowFrontend.scrollTo(100, 273);

    } else {
        //mobile
        wixWindowFrontend.scrollTo(100, 947);

    }

}