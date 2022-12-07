'use strict';

const fs = require("fs");

module.exports.info  = 'Querying information about a patient';

let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = async function() {
 
    let min = 1;
    let max = 5000;
    let id = Math.floor(Math.random() * (max - min + 1)) + min;
    id = id.toString();
    let args;

    var fs = require('fs');

    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'queryNoteeventbyCategory',
            chaincodeArguments: [category]
        };
    }

    let results = await bc.querySmartContract(contx, 'testecouch', 'v0', args, 120);

    for (let result of results) {
        let executionTime = result.GetTimeFinal() - result.GetTimeCreate();

        try {
            fs.appendFileSync('queryNoteeventResults.txt', executionTime + '\n');
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    return results;

};

module.exports.end = function() {
    return Promise.resolve();
};