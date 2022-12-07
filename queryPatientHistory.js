'use strict';

module.exports.info  = 'Querying information about a patient';

let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = async function() {
 
    let min = 249;
    let max = 269;
    let id = Math.floor(Math.random() * (max - min + 1)) + min;
    id = id.toString();
    let args;

    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'getHistoryForPatient',
            chaincodeArguments: [id]
        };
    }

    let results = await bc.querySmartContract(contx, 'testecouch', 'v0', args, 120);

    for (let result of results) {
        let shortID = result.GetID().substring(8);
        let executionTime = result.GetTimeFinal() - result.GetTimeCreate();
        console.log('TX ' + shortID + ' took ' + executionTime + ' ms to execute. Result: ' + result.GetStatus());
        console.log(result.GetResult().toString());
    }

    return results;
};

module.exports.end = function() {
    return Promise.resolve();
};
