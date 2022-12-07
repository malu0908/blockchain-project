/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
    let max = 1000;
    //let id = 250;
    let id = Math.floor(Math.random() * (max - min + 1)) + min;
    //let docType = 'patients';
    id = id.toString();
    let args;

    var fs = require('fs');

    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'queryPatientById',
            chaincodeArguments: [id]
        };
    }

    let results = await bc.querySmartContract(contx, 'testecouch', 'v0', args, 600000);
    
    for (let result of results) {
        let executionTime = result.GetTimeFinal() - result.GetTimeCreate();

	    //console.log(result.GetResult().toString());         

        try {
            fs.appendFileSync('queryPatientResults.txt', executionTime + '\n');
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
