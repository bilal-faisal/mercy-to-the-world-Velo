// jsw file

function calculateAmount10days(distribution, totalAmount, totalNumberOfDays, differenceInDays) {
    const numberOfDays = totalNumberOfDays - differenceInDays;
    let amounts = new Array(numberOfDays).fill(0); // Initialize with zeroes

    console.log(numberOfDays)
    console.log(differenceInDays)

    switch (distribution) {
    case "evenly":
        amounts.fill(totalAmount / numberOfDays); // Evenly distribution
        break;

    case "All on the Day of Arafah":
        amounts[amounts.length - 2] = totalAmount;
        break;

    case "1.5 times on Arafah": {
        let baseAmount1_5 = totalAmount / (numberOfDays + 0.5); // Adjust for 1.5x on Arafah
        amounts.fill(baseAmount1_5); // Distribute base amount
        if (numberOfDays >= 9 - differenceInDays) {
            amounts[8 - differenceInDays] = baseAmount1_5 * 1.5; // 9th day (Arafah) adjustment
        }
        break;
    }
    case "2 times on Arafah": {
        let baseAmount2 = totalAmount / (numberOfDays + 1); // Adjust for 2x on Arafah
        amounts.fill(baseAmount2);
        if (numberOfDays >= 9 - differenceInDays) {
            amounts[8 - differenceInDays] = baseAmount2 * 2; // 9th day (Arafah) adjustment
        }
        break;
    }
    case "3 times on Arafah": {
        let baseAmount3 = totalAmount / (numberOfDays + 2); // Adjust for 3x on Arafah
        amounts.fill(baseAmount3);
        if (numberOfDays >= 9 - differenceInDays) {
            amounts[8 - differenceInDays] = baseAmount3 * 3; // 9th day (Arafah) adjustment
        }
        break;
    }
    }

    // Fixing decimal places
    amounts = amounts.map(amount => parseFloat(amount.toFixed(2)));

    return amounts;
}

export function generateDailyCharges10days(totalAmount, startDate, distribution) {
    const numberOfDays = 10;
    const days = [];
    const startDateObj = new Date(startDate);
    const todaysDate = new Date();
    // const todaysDate = new Date("9 June, 2024")
    startDateObj.setHours(0, 0, 0, 0)
    todaysDate.setHours(0, 0, 0, 0)

    const differenceInMilliseconds = todaysDate.getTime() - startDateObj.getTime();
    let differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (differenceInDays < 0) {
        differenceInDays = 0
    }

    let amounts = calculateAmount10days(distribution, totalAmount, numberOfDays, differenceInDays);

    function formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    function getOrdinalIndicator(number) {
        const j = number % 10,
            k = number % 100;
        if (j === 1 && k !== 11) return number + "ST";
        if (j === 2 && k !== 12) return number + "ND";
        if (j === 3 && k !== 13) return number + "RD";
        return number + "TH";
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
            dueDate: formatDate(currentDate)
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

// for Ramdan split calculations 

