// // Our sales team has just struck a deal with Acme Inc to become the exclusive provider for routing their product shipments via 3rd party trucking
// fleets. The catch is that we can only route one shipment to one driver per day.
// Each day we get the list of shipment destinations that are available for us to offer to drivers in our network. Fortunately our team of highly trained
// data scientists have developed a mathematical model for determining which drivers are best suited to deliver each shipment.
// With that hard work done, now all we have to do is implement a program that assigns each shipment destination to a given driver while
// maximizing the total suitability of all shipments to all drivers.
// The top-secret algorithm is:
// If the length of the shipment's destination street name is even, the base suitability score (SS) is the number of vowels in the driver’s
// name multiplied by 1.5.
// If the length of the shipment's destination street name is odd, the base SS is the number of consonants in the driver’s name multiplied by
// 1.
// If the length of the shipment's destination street name shares any common factors (besides 1) with the length of the driver’s name, the
// SS is increased by 50% above the base SS.

// Write an application in the language of your choice that assigns shipment destinations to drivers in a way that maximizes the total SS over the set
// of drivers. Each driver can only have one shipment and each shipment can only be offered to one driver. Your program should run on the
// command line and take as input two newline separated files, the first containing the street addresses of the shipment destinations and the second
// containing the names of the drivers. The output should be the total SS and a matching between shipment destinations and drivers. You do not
// need to worry about malformed input, but you should certainly handle both upper and lower case names.

// const fs = require('fs');
const readline = require('readline');

const inquirer = require('inquirer');
const munkres = require('munkres-js');

const {getNumberOfVowels, 
       hasLengthWithCommonFactors, 
       getNumberOfConsonants,
       fileToArray,
       initMatrix
      } = require('./helpers');



// const { drivers, destinations } = data;
// const { drivers, destinations } = await inquireDataFiles();
// const dato =  await inquireDataFiles();
// console.log(res);
// console.log(inquireDataFiles()); 
// const { totalScore, assignments } = getScoreAndMakeAssignments(drivers, destinations);
// displayOutput(totalScore, assignments);

const inquireDataFiles = async () => {
    const input = await inquirer.prompt([
        {
            name: 'shippingFile',
            message: 'Path to shipping file (./files/shipments.txt)'
        },
        {
            name: 'driversFile',
            message: 'Path to drivers file (./files/drivers.txt)'
        }
    ]);
    if (!input.shippingFile || !input.driversFile) {
        input.shippingFile = './files/shipments.txt';
        input.driversFile = './files/drivers.txt';
    }

    const { shippingFile, driversFile } = input;

    const destinations =  fileToArray(shippingFile);
    const drivers =  fileToArray(driversFile);
   
    return { drivers, destinations }; 
}


function displayOutput(score, assignments) {
    console.log(`Score: ${score}`);
    assignments.forEach((destination, driver) => {
        console.log(`\tDriver: ${driver}`);
        console.log(`\tDestination: ${destination}\n`);
    });
}

function getScoreAndMakeAssignments(names, addresses) {
   
    const namesToAddressesMap = initMatrix(names.length, {});
    console.log(namesToAddressesMap);
    const { rewards, costs } = createRewardAndCostMatrices(names, addresses, namesToAddressesMap);
    console.log(costs);
    const assignmentIndexes = munkres(costs);
    const totalScore = calculateTotalSuitabilityScore(rewards, assignmentIndexes);
    const assignments = getNamesAndAddresses(assignmentIndexes, namesToAddressesMap);
    return { totalScore, assignments };
}
function createRewardAndCostMatrices(names, addresses, namesToAddressesMap) {
   
    const n = addresses.length;
    const rewardMatrix = initMatrix(n, new Number(0));
    
    names.forEach((name, row) => {
        addresses.forEach((address, column) => {
            rewardMatrix[row][column] = calculateSuitabilityScore(name, address);
            namesToAddressesMap[row][column] = { driver: name, destination: address };
        });
    });
    // Convert reward matrix to cost matrix
    const costMatrix = rewardMatrix.map((row) => {
        return row.map((score) => {
            // Use arbitrarily large value to subtract from
            return 100 - score;
        });
    });
    return { rewards: rewardMatrix, costs: costMatrix };
}
function calculateTotalSuitabilityScore(scores, indices) {
    return indices.reduce((totalScore, current) => {
        return totalScore + scores[current[0]][current[1]];
    }, 0);
}


// Calculate the base suitability score based on the address length
// and the number of vowels in the name
function calculateSuitabilityScore(name, address) {
    let score = address.length % 2 == 0 
        ?getNumberOfVowels(name) * 1.5 // Even address length
        :getNumberOfConsonants(name); // Odd address length
    // Augment score if address length shares common factors with name length
    return hasLengthWithCommonFactors(name, address) 
            ? score * 1.5 // Increase by 50% above base SS
            :score;
}
const  getNamesAndAddresses = (indexes, mapping) => {
    const namesAndAddresses = new Map();
    indexes.forEach((current) => {
        const nameAndAddress = mapping[current[0]][current[1]];
        namesAndAddresses.set(nameAndAddress.driver, nameAndAddress.destination);
    });
    return namesAndAddresses;
}

const init = () => {
    const dataArr = inquireDataFiles();
    const res = dataArr.then(data => {
        const { drivers, destinations } = data;
        const { totalScore, assignments } = getScoreAndMakeAssignments(drivers, destinations);
        displayOutput(totalScore, assignments);
        
    });
}

(function() {
    init();
})();