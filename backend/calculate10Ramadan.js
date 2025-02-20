// jsw file

function calculateAmountLast10Days(distribution, totalAmount, totalDays, startDay) {
    let amounts = new Array(totalDays).fill(0);

    const lastTenOddNights = [21, 23, 25, 27, 29];
    const remainingOddNights = lastTenOddNights.filter(night => night >= 21);

    switch (distribution) {
    case "Evenly Distributed":
        amounts.fill(totalAmount / totalDays);
        break;

    case "All on 21st Night":
    case "All on 23rd Night":
    case "All on 25th Night":
    case "All on 27th Night":
    case "All on 29th Night": {
        //       const targetNight = parseInt(distribution.match(/\d+/)[0], 10);
        //       const index = targetNight - 21;
        //       if (index >= 0 && index < totalDays) {
        //           amounts[index] = totalAmount;
        //       }
        //       break;
        //   } 
        let targetNight = parseInt(distribution.match(/\d+/)[0], 10);

        // Find the next available odd night
        let validNight = remainingOddNights.find(night => night >= targetNight);

        if (!validNight && remainingOddNights.length > 0) {
            validNight = remainingOddNights[0]; // Use the next available odd night
        }

        if (validNight) {
            const index = validNight - startDay;
            if (index >= 0 && index < totalDays) {
                amounts[index] = totalAmount;
            }
        } else {
            // If no odd night remains, allocate to the last available day
            amounts[totalDays - 1] = totalAmount;
        }
        break;
    }
    case "Split Equally on All Odd Nights": {
        const endDay = startDay + totalDays - 1;
        const validOddNights = lastTenOddNights.filter(
            night => night >= startDay && night <= endDay
        );
        const numOddNights = validOddNights.length;

        if (numOddNights > 0) {
            let equalShare = totalAmount / numOddNights;
            equalShare = parseFloat(equalShare.toFixed(2));
            let distributedTotal = 0;

            validOddNights.forEach((night) => {
                const index = night - startDay; // Correct index based on startDay
                if (index >= 0 && index < totalDays) {
                    amounts[index] = equalShare;
                    distributedTotal += equalShare;
                }
            });

            // Adjust for rounding errors
            let roundingDifference = totalAmount - distributedTotal;
            if (roundingDifference !== 0) {
                validOddNights.some((night) => {
                    const index = night - startDay;
                    if (index >= 0 && index < totalDays) {
                        amounts[index] += roundingDifference;
                        amounts[index] = parseFloat(amounts[index].toFixed(2));
                        return true; // Stop after adjusting the first valid night
                    }
                    return false;
                });
            }
        }
        break;
    }

    case "1.5 times on Last 10 Odd Nights":
    case "2 times on Last 10 Odd Nights":
    case "3 times on Last 10 Odd Nights": {
        const multiplier = distribution.includes("1.5") ? 1.5 : distribution.includes("2") ? 2 : 3;
        const oddNightCount = remainingOddNights.length;
        const totalMultiplier = (oddNightCount * (multiplier - 1)) + totalDays;
        const baseAmount = totalAmount / totalMultiplier;

        remainingOddNights.forEach(night => {
            const index = night - 21;
            if (index >= 0 && index < totalDays) {
                amounts[index] = baseAmount * multiplier;
            }
        });

        for (let i = 0; i < totalDays; i++) {
            if (amounts[i] === 0) {
                amounts[i] = baseAmount;
            }
        }
        break;
    }
    }
    console.log("this is the amount array :", amounts);
    return amounts.map(amount => Math.max(0, parseFloat(amount.toFixed(2))));
}

export function generateDailyChargesLast10Days(totalAmount, startDate, distribution, thirtiethNight = false) {
    let totalDays = thirtiethNight ? 10 : 9;
    const days = [];
    const startDateObj = new Date(startDate);

    // Calculate the 21st day of Ramadan
    const ramadan21st = new Date(startDateObj);
    ramadan21st.setDate(startDateObj.getDate() + 20); // 21st day is 20 days after the 1st day

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Calculate days since the 21st of Ramadan
    const timeDiff = today.getTime() - ramadan21st.getTime();
    const daysSince21st = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Determine the current day in Ramadan (1-based)
    const ramadanDayToday = 21 + daysSince21st;

    // Determine end day based on thirtiethNight flag
    const endDay = thirtiethNight ? 30 : 29;

    // Determine the starting day, ensuring it's within the last 10 days and not in the past
    let startDay = Math.max(21, ramadanDayToday);
    startDay = Math.min(startDay, endDay); // Ensure startDay doesn't exceed endDay

    // Calculate remaining days
    let remainingDays = Math.max(0, endDay - startDay + 1);
    remainingDays = Math.min(remainingDays, totalDays); // Ensure it doesn't exceed initial totalDays

    // Adjust the start date to the correct starting day
    const adjustedStartDate = new Date(ramadan21st);
    adjustedStartDate.setDate(ramadan21st.getDate() + (startDay - 21));

    // Calculate amounts based on remaining days
    let amounts = calculateAmountLast10Days(distribution, totalAmount, remainingDays, startDay);

    function formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    function getOrdinalIndicator(number) {
        const j = number % 10,
            k = number % 100;
        if (j === 1 && k !== 11) return number + "st";
        if (j === 2 && k !== 12) return number + "nd";
        if (j === 3 && k !== 13) return number + "rd";
        return number + "th";
    }

    for (let i = 0; i < remainingDays; i++) {
        const currentDate = new Date(adjustedStartDate);
        currentDate.setDate(adjustedStartDate.getDate() + i);

        days.push({
            day: `${getOrdinalIndicator(startDay + i)} DAY`,
            amount: parseFloat(amounts[i]),
            dueDate: formatDate(currentDate),
        });
    }

    // Adjust for any floating point discrepancies
    let calculatedTotal = days.reduce((acc, obj) => acc + obj.amount, 0);
    const difference = totalAmount - calculatedTotal;
    if (difference !== 0) {
        days[days.length - 1].amount += difference;
        days[days.length - 1].amount = parseFloat(days[days.length - 1].amount.toFixed(2));
    }

    return days;
}

// function calculateAmountLast10Days(distribution, totalAmount, totalDays) {
//     let amounts = new Array(totalDays).fill(0); // Initialize amounts array with zeros

//     // The last 10 odd nights of Ramadan (21st, 23rd, 25th, 27th, 29th)
//     const lastTenOddNights = [21, 23, 25, 27, 29];
//     const remainingOddNights = lastTenOddNights.filter(night => night >= 21);

//     switch (distribution) {
//     case "Evenly Distributed":
//         amounts.fill(totalAmount / totalDays);
//         break;

//     case "All on 27th Night": {
//         const index = 27 - 21;
//         if (index >= 0 && index < totalDays) {
//             amounts[index] = totalAmount;
//         }
//         break;
//     }

//     case "1.5 times on Last 10 Odd Nights":
//     case "2 times on Last 10 Odd Nights":
//     case "3 times on Last 10 Odd Nights": {
//         const multiplier = distribution.includes("1.5") ? 1.5 : distribution.includes("2") ? 2 : 3;
//         const oddNightCount = remainingOddNights.length;
//         const totalMultiplier = (oddNightCount * (multiplier - 1)) + totalDays;
//         const baseAmount = totalAmount / totalMultiplier;

//         remainingOddNights.forEach(night => {
//             const index = night - 21;
//             if (index >= 0 && index < totalDays) {
//                 amounts[index] = baseAmount * multiplier;
//             }
//         });

//         for (let i = 0; i < totalDays; i++) {
//             if (amounts[i] === 0) {
//                 amounts[i] = baseAmount;
//             }
//         }
//         break;
//     }
//     }

//     return amounts.map(amount => parseFloat(amount.toFixed(2)));
// }

// export function generateDailyChargesLast10Days(totalAmount, startDate, distribution, thirtiethNight = false) {
//     const totalDays = thirtiethNight ? 10 : 9;
//     const days = [];
//     const startDateObj = new Date(startDate);

//     startDateObj.setDate(startDateObj.getDate() + 20); // Move to the 21st of Ramadan

//     let amounts = calculateAmountLast10Days(distribution, totalAmount, totalDays);

//     function formatDate(date) {
//         return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
//     }

//     function getOrdinalIndicator(number) {
//         const j = number % 10,
//             k = number % 100;
//         if (j === 1 && k !== 11) return number + "st";
//         if (j === 2 && k !== 12) return number + "nd";
//         if (j === 3 && k !== 13) return number + "rd";
//         return number + "th";
//     }

//     for (let i = 0; i < totalDays; i++) {
//         const currentDate = new Date(startDateObj);
//         currentDate.setDate(startDateObj.getDate() + i);

//         days.push({
//             day: `${getOrdinalIndicator(21 + i)} DAY`,
//             amount: parseFloat(amounts[i]),
//             dueDate: formatDate(currentDate),
//         });
//     }

//     let calculatedTotal = days.reduce((acc, obj) => acc + obj.amount, 0);
//     const difference = totalAmount - calculatedTotal;
//     if (difference !== 0) {
//         days[days.length - 1].amount += difference;
//         days[days.length - 1].amount = parseFloat(days[days.length - 1].amount.toFixed(2));
//     }

//     return days;
// } 