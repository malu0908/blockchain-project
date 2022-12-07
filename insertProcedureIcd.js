'use strict';

const fs = require("fs");

module.exports.info  = 'Reading information from file procedures_icd';

let bc, contx;
var total = 0;

function processFile(){

    const csvString = fs.readFileSync("/home/ana/physionet.org/files/mimiciii/1.4/PROCEDURES_ICD.csv").toString("utf-8");
 
    let lineArray = csvString.split(/\r?\n/);
 
    // First line are headers
    const headers = lineArray[0].split(",");
 
    // Remove the headers from the line array
    lineArray = lineArray.splice(1);
 
    const csv = lineArray.map(line => {
        const entries = line.split(",");
 
        // Makes an object with every header as properties
        const ret = {};
        for(let i = 0; i < headers.length; i++){
            ret[i] = entries[i];
        }

        return ret;
    })
    return csv;
}  

function generateWorkload() {
    let workload = [];
    const csv = processFile();

    for(let i= total-1; i < total; i++) {
 
        if (bc.getType() === 'fabric') {
            workload.push({
                chaincodeFunction: 'insertProcedureIcd',
                chaincodeArguments: [csv[total][0], csv[total][1], csv[total][2], 
                csv[total][3], csv[total][4]]
            });
        } 
    }
    return workload;
}

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = function() {
    let args = generateWorkload();
    
    total++;    

    return bc.invokeSmartContract(contx, 'testecouch', 'v0', args, 30);
};

module.exports.end = function() {
    
    return Promise.resolve();
};
