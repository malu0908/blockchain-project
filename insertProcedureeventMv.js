'use strict';

const fs = require("fs");

module.exports.info  = 'Reading information from file procedureevents_mv';

let bc, contx;
var total = 0;

function processFile(){

    const csvString = fs.readFileSync("/home/ana/physionet.org/files/mimiciii/1.4/PROCEDUREEVENTS_MV.csv").toString("utf-8");
 
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
                chaincodeFunction: 'insertProcedureeventMv',
                chaincodeArguments: [csv[total][0], csv[total][1], csv[total][2], 
                csv[total][3], csv[total][4], csv[total][5], csv[total][6], csv[total][7],
                csv[total][8], csv[total][9], csv[total][10], csv[total][11], csv[total][12], 
                csv[total][13], csv[total][14], csv[total][15], csv[total][16], csv[total][17],
                csv[total][18], csv[total][19], csv[total][20], csv[total][21], csv[total][22], 
                csv[total][23], csv[total][24]]
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
