'use strict';

const fs = require("fs");

module.exports.info  = 'Reading information from file patients';

let bc, contx;
let position = 78;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = async function() {

    const fd = fs.openSync("/home/ana/physionet.org/files/mimiciii/1.4/PATIENTS.csv", 'r');

    let line = "";
    const charBuffer = Buffer.alloc(1);

    let args = [];

    while(charBuffer.toString() !== '\n') {
        fs.readSync(fd, charBuffer, 0, 1, position);
        
        position++;

        line+=charBuffer.toString();

    }

    if(charBuffer.toString() === '\n') {
        line = line.replace(/\r?\n/g,"");

        let entries = line.split(",");
	
        if (bc.getType() === 'fabric') {
            args.push({
                chaincodeFunction: 'insertPatient',
                chaincodeArguments: [entries[0], entries[1], entries[2], 
                entries[3], entries[4], entries[5], entries[6], entries[7]],
            });
        } 
        
        line = "";
	    
    } 

    fs.closeSync(fd);

    let results = await bc.invokeSmartContract(contx, 'testecouch', 'v0', args, 600000);
   
    for (let result of results) {
        let executionTime = result.GetTimeFinal() - result.GetTimeCreate();

	    //console.log(result.GetResult().toString());
        
        try {
            fs.appendFileSync('insertPatientResults.txt', executionTime + '\n');
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
