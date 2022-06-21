const inquirer = require('inquirer');
const munkres = require('munkres-js');

const {getVowels, 
       hasLengthWithCommonFactors, 
       getConsonants,
       fileToArray,
       initMatrix
      } = require('./helpers'); 

const inquireDataFiles = async () => {
    const input = await inquirer.prompt([
        {
            name: 'shippingAddressFile',
            message: 'Path to shipping addresses file (press `Enter` to use default file: `./files/shipments.txt`)'
        },
        {
            name: 'driversFile',
            message: 'Path to drivers file (press `Enter` to use default file:  `./files/drivers.txt`)'
        }
    ]);
    if (!input.shippingAddressFile || !input.driversFile) {
        input.shippingAddressFile = './files/shipments.txt';
        input.driversFile = './files/drivers.txt';
    }

    const { shippingAddressFile, driversFile } = input;

    const destinationsArr =  fileToArray(shippingAddressFile);
    const driversArr =  fileToArray(driversFile);
   
    return { driversArr, destinationsArr }; 
}


const getScoreAndMakeRoutesAssignment = (names, addresses) => {
   
    const namesToAddressesArr = initMatrix(names.length, {});
    const { rewards, costs } = createRewardAndCostMatrices(names, addresses, namesToAddressesArr);

    const assignmentIndexes = munkres(costs);
    const totalScore = calculateTotalSuitabilityScore(rewards, assignmentIndexes);
    const routesAssignment = getNamesAndAddresses(assignmentIndexes, namesToAddressesArr);
    return { totalScore, routesAssignment };
}

const createRewardAndCostMatrices = (names, addresses, namesToAddressesMap) => {
   
    const n = addresses.length;
    const rewardsArr = initMatrix(n, new Number(0));
    
    names.forEach((name, row) => {
        addresses.forEach((address, column) => {
            rewardsArr[row][column] = getSuitabilityScore(name, address);
            namesToAddressesMap[row][column] = { driver: name, destination: address };
        });
    });
    // Get cost matrix
    const costsArr = rewardsArr.map((row) => {
        return row.map((score) => {
            return 100 - score;
        });
    });
    return { rewards: rewardsArr, costs: costsArr };
}
const calculateTotalSuitabilityScore = (scores, indexes) => {
    return indexes.reduce((totalScore, current) => {
        return totalScore + scores[current[0]][current[1]];
    }, 0);
}


// Calculate the base suitability score
const getSuitabilityScore = (name, address) =>{
    let score = address.length % 2 == 0 
            ? getVowels(name) * 1.5 // even length
            : getConsonants(name); // odd length
    // Augment score if address length shares common factors with name length
    return hasLengthWithCommonFactors(name, address) 
            ? score * 1.5 // Increase by 50% above base SS
            : score;
}

const getNamesAndAddresses = (indexes, mapping) => {
    const driversAndShippingAddress = new Map();
    indexes.forEach((current) => {
        const nameAndAddress = mapping[current[0]][current[1]];
        driversAndShippingAddress.set(nameAndAddress.driver, nameAndAddress.destination);
    });
    return driversAndShippingAddress;
}

const init = () => {
    const dataArr = inquireDataFiles();
    dataArr.then(data => {
        const { driversArr, destinationsArr } = data;
        const { totalScore, routesAssignment } = getScoreAndMakeRoutesAssignment(driversArr, destinationsArr);
        // display results:
        console.log(`Suitability Score : ${totalScore}`);
        console.log(`==========================================================`);
        routesAssignment.forEach((address, driver) => {
            console.log(`${driver} ---> ${address}`);
        });
        
    });
}

(function() {
    init();
})();