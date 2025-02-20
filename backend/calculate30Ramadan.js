function calculateAmountRamadan(distribution, totalAmount, totalNumberOfDays, differenceInDays) {
    const numberOfDays = totalNumberOfDays - differenceInDays; // Remaining days in Ramadan
    let amounts = new Array(numberOfDays).fill(0); // Initialize amounts array with zeros

    // The last 10 odd nights of Ramadan (21st, 23rd, 25th, 27th, 29th)
    const lastTenOddNights = [21, 23, 25, 27, 29];
    const remainingOddNights = lastTenOddNights.filter(night => night > differenceInDays); // Filter for remaining odd nights

    switch (distribution) {
    case "Evenly Distributed":
        amounts.fill(totalAmount / numberOfDays);
        break;

    case "All on 27th Night":
    case "All on 21st Night":
    case "All on 23rd Night":
    case "All on 25th Night":
    case "All on 29th Night": {
        const nightMap = {
            "All on 21st Night": 21,
            "All on 23rd Night": 23,
            "All on 25th Night": 25,
            "All on 27th Night": 27,
            "All on 29th Night": 29
        };
        const targetNight = nightMap[distribution];
        const index = targetNight - 1 - differenceInDays;
        if (index >= 0 && index < numberOfDays) {
            amounts[index] = totalAmount;
        }
        break;
    }

    case "split Equally All odds night": {
        const validOddNights = remainingOddNights.filter(night => night - 1 - differenceInDays >= 0);
        const numOddNights = validOddNights.length;

        if (numOddNights > 0) {
            let equalShare = totalAmount / numOddNights;
            equalShare = parseFloat(equalShare.toFixed(2)); // Ensure decimal precision
            let distributedTotal = 0;

            validOddNights.forEach(night => {
                const index = night - 1 - differenceInDays;
                if (index >= 0 && index < numberOfDays) {
                    amounts[index] = equalShare;
                    distributedTotal += equalShare;
                }
            });

            // Adjust for rounding errors
            let roundingDifference = totalAmount - distributedTotal;
            if (roundingDifference !== 0) {
                for (let i = 0; i < validOddNights.length; i++) {
                    const index = validOddNights[i] - 1 - differenceInDays;
                    if (index >= 0 && index < numberOfDays) {
                        amounts[index] += roundingDifference;
                        amounts[index] = parseFloat(amounts[index].toFixed(2));
                        break;
                    }
                }
            }
        } else {
            amounts.fill(totalAmount / numberOfDays);
        }
        break;
    }

    case "1.5 times on Last 10 Odd Nights":
    case "2 times on Last 10 Odd Nights":
    case "3 times on Last 10 Odd Nights": {
        const multiplier = distribution.includes("1.5") ? 1.5 :
            distribution.includes("2") ? 2 : 3;

        const oddNightCount = remainingOddNights.length;
        const totalMultiplier = (oddNightCount * (multiplier - 1)) + numberOfDays;
        const baseAmount = totalAmount / totalMultiplier;

        remainingOddNights.forEach(night => {
            const index = night - 1 - differenceInDays;
            if (index >= 0 && index < numberOfDays) {
                amounts[index] = baseAmount * multiplier;
            }
        });

        for (let i = 0; i < numberOfDays; i++) {
            if (amounts[i] === 0) {
                amounts[i] = baseAmount;
            }
        }
        break;
    }
    }

    // Fix decimal places
    amounts = amounts.map(amount => parseFloat(amount.toFixed(2)));

    return amounts;
}

// The rest of your existing code (generateDailyChargesRamadan export) remains unchanged

export function generateDailyChargesRamadan(totalAmount, startDate, distribution, thirtiethNight = false) {
    const numberOfDays = thirtiethNight ? 30 : 29; // 30 days if the flag is true, otherwise 29
    const days = [];
    const startDateObj = new Date(startDate);
    const todaysDate = new Date();

    startDateObj.setHours(0, 0, 0, 0);
    todaysDate.setHours(0, 0, 0, 0);

    const differenceInMilliseconds = todaysDate.getTime() - startDateObj.getTime();
    let differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (differenceInDays < 0) {
        differenceInDays = 0;
    }

    let amounts = calculateAmountRamadan(distribution, totalAmount, numberOfDays, differenceInDays);

    function formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    }

    function getOrdinalIndicator(number) {
        const j = number % 10,
            k = number % 100;
        if (j === 1 && k !== 11) return number + "st";
        if (j === 2 && k !== 12) return number + "nd";
        if (j === 3 && k !== 13) return number + "rd";
        return number + "th";
    }

    for (let i = 1; i <= numberOfDays; i++) {
        if (i <= differenceInDays) {
            continue;
        }
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + i - 1); // Incrementing the date

        days.push({
            day: `${getOrdinalIndicator(i)} DAY`,
            amount: parseFloat(amounts[i - differenceInDays - 1]),
            dueDate: formatDate(currentDate),
        });
    }

    // Calculate the total distributed amount and adjust the last day if needed
    let calculatedTotal = days.reduce((acc, obj) => acc + obj.amount, 0);

    // Calculate the difference and adjust the last day's amount
    const difference = totalAmount - calculatedTotal;
    if (difference !== 0) {
        days[days.length - 1].amount += difference;
        days[days.length - 1].amount = parseFloat(days[days.length - 1].amount.toFixed(2));
    }

    return days;
}