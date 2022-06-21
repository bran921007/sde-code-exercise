const fs = require('fs');

const getVowels = (str) => {
    return str.match(/[aeiou]/gi).length;
}

const getConsonants = (str) => {
    return str.match(/[bcdfghjklmnpqrstvwxyz]/gi).length;
}

// helper function to check if a string has a length with common factors
const hasLengthWithCommonFactors = (str1, str2) => {
    const str1LengthArr = getFactors(str1.length);
    const str2LengthArr = getFactors(str2.length);
    return str1LengthArr.some(factor => str2LengthArr.includes(factor));
}
 
// Returning an array of all the factors of the given number, except for 1.
const getFactors = (length) => {
    return Array.from(Array(length), (x, i) => i + 2)
                .filter(i => length % i === 0);
}

const stripWhiteSpace = (str) => { 
    return str.replace(/\s+/g, '');
}

const fileToArray = (filepath) => {
    return fs.readFileSync(filepath).toString().split('\n');
}

const initMatrix = (size, initValue) => {
    let matrix = [];
    for(var i=0; i<size; i++) {
        matrix[i] = new Array(size).fill(initValue);
    }
    return matrix;
}

module.exports = {
    getVowels,
    getConsonants,
    hasLengthWithCommonFactors,
    stripWhiteSpace,
    fileToArray,
    initMatrix
}