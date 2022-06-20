const fs = require('fs');

function getNumberOfVowels(str) {
    return str.match(/[aeiou]/gi).length;
}

function getNumberOfConsonants(str) {
    return str.match(/[bcdfghjklmnpqrstvwxyz]/gi).length;
}

// helper function to check if a string has a length with common factors
function hasLengthWithCommonFactors(str1, str2) {
    const str1LengthFactors = getFactorsBesides1(str1.length);
    const str2LengthFactors = getFactorsBesides1(str2.length);
    return str1LengthFactors.some(factor => str2LengthFactors.includes(factor));
}

/* Returning an array of all the factors of the given number, except for 1. */
function getFactorsBesides1(length) {
    return Array.from(Array(length), (_, i) => i + 2)
                .filter(i => length % i === 0);
}

function stripWhiteSpace(str) {
    return str.replace(/\s+/g, '');
}

function fileToArray(filepath) {
    return fs.readFileSync(filepath).toString().split('\n');
}

function initMatrix(size, initValue) {
    var matrix = [];
    for(var i=0; i<size; i++) {
        matrix[i] = new Array(size).fill(initValue);
    }
    return matrix;
}

module.exports = {
    getNumberOfVowels,
    getNumberOfConsonants,
    hasLengthWithCommonFactors,
    stripWhiteSpace,
    fileToArray,
    initMatrix
}