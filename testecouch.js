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

/*
* NOTE: This implementation is a derivative work of the following:
* https://github.com/hyperledger/fabric-samples/blob/release-1.1/chaincode/marbles02/node/marbles_chaincode.js
* The modifications include: bug fixes and refactoring for eslint compliance.
*/

/* eslint-disable no-console */

'use strict';
const shim = require('fabric-shim');
const util = require('util');

/**
 * Marble asset management chaincode written in node.js, implementing {@link ChaincodeInterface}.
 * @type {SimpleChaincode}
 * @extends {ChaincodeInterface}
 */
let Chaincode = class {
    /**
     * Called during chaincode instantiate and upgrade. This method can be used
     * to initialize asset states.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub is implemented by the fabric-shim
     * library and passed to the {@link ChaincodeInterface} calls by the Hyperledger Fabric platform. The stub
     * encapsulates the APIs between the chaincode implementation and the Fabric peer.
     * @return {Promise<SuccessResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async Init(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        console.info('=========== Instantiated Marbles Chaincode ===========');
        return shim.success();
    }

    /**
     * Called throughout the life time of the chaincode to carry out business
     * transaction logic and effect the asset states.* The provided functions are the following: initMarble, delete, transferMarble, readMarble, getMarblesByRange,
     * transferMarblesBasedOnColor, queryMarblesByOwner, queryMarbles, getHistoryForMarble.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub is implemented by the fabric-shim
     * library and passed to the {@link ChaincodeInterface} calls by the Hyperledger Fabric platform. The stub
     * encapsulates the APIs between the chaincode implementation and the Fabric peer.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());
        console.info(util.format('Args: %j', stub.getArgs()));

        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.log('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    } 

    /**
     * Creates a new patient with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: gender. Index 3: dob. Index 4: dod. Index 5: dodHosp. Index 6: dodSsn. 
     * Index 7: expireFlag.
     */
    async insertPatient(stub, args) {
        if (args.length !== 8) {
            throw new Error('Incorrect number of arguments. Expecting 8');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let gender = args[2];
        let dob = args[3];
        let dod = args[4];
        let dodHosp = args[5];
        let dodSsn = args[6];
        let expireFlag = parseInt(args[7]);

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(subjectId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + subjectId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'patients';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.gender = gender;
        input.dob = dob;
        input.dod = dod;
        input.dodHosp = dodHosp;
        input.dodSsn = dodSsn;
        input.expireFlag = expireFlag;

        // === Save an input to state ===
        await stub.putState(subjectId, Buffer.from(JSON.stringify(input)));
        let indexName = 'docType~subjectId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.docType, input.subjectId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(indexName, Buffer.from(subjectNameIndexKey));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init patient');

        return Buffer.from(JSON.stringify(input));
    };

    /**
     * Creates a new patient admission with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: admittime. Index 4: dischtime. Index 5: deathtime. Index 6: admissionType. 
     * Index 7: admissionLocation. Index 8: dischargeLocation. Index 9: insurance. Index 10: language.
     * Index 11: religion. Index 12: maritalStatus. Index 13: ethnicity. Index 14: edregtime.
     * Index 15: edouttime. Index 16: diagnosis. Index 17: hospitalExpireFlag. 
     * Index 18: hasCharteventsData.
     */
    async insertAdmission(stub, args) {
        if (args.length !== 19) {
            throw new Error('Incorrect number of arguments. Expecting 19');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient admission ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }
        if (args[8].length <= 0) {
            throw new Error('9rd argument must be a non-empty string');
        }
        if (args[9].length <= 0) {
            throw new Error('10rd argument must be a non-empty string');
        }
        if (args[13].length <= 0) {
            throw new Error('14rd argument must be a non-empty string');
        }
        if (args[18].length <= 0) {
            throw new Error('19rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let admittime = args[3];
        let dischtime = args[4];
        let deathtime = args[5];
        let admissionType = args[6];
        let admissionLocation = args[7];
        let dischargeLocation = args[8];
        let insurance = args[9];
        let language = args[10];
        let religion = args[11];
        let maritalStatus = args[12];
        let ethnicity = args[13];
        let edregtime = args[14];
        let edouttime = args[15];
        let diagnosis = args[16];
        let hospitalExpireFlag = args[17];
        let hasCharteventsData = args[18];

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(hadmId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + hadmId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'admission';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.dadmittime = admittime;
        input.dischtime = dischtime;
        input.deathtime = deathtime;
        input.admissionType = admissionType;
        input.admissionLocation = admissionLocation;
        input.dischargeLocation = dischargeLocation;
        input.insurance = insurance;
        input.language = language;
        input.religion = religion;
        input.maritalStatus = maritalStatus;
        input.ethnicity = ethnicity;
        input.edregtime = edregtime;
        input.edouttime = edouttime;
        input.diagnosis = diagnosis;
        input.hospitalExpireFlag = hospitalExpireFlag;
        input.hasCharteventsData = hasCharteventsData;

        // === Save an input to state ===
        await stub.putState(hadmId, Buffer.from(JSON.stringify(input)));
        let indexName = 'hadmId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.hadmId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init patient admission');
    };

    /**
     * Creates a new patient icu stay with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: dbsource. Index 5: firstCareunit. Index 6: lastCareunit. 
     * Index 7: firstWardid. Index 8: lastWardid. Index 9: intime. Index 10: outtime.
     * Index 11: los. 
     */
    async insertIcustay(stub, args) {
        if (args.length !== 12) {
            throw new Error('Incorrect number of arguments. Expecting 12');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient icu stay ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
        if (args[5].length <= 0) {
            throw new Error('6rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }
        if (args[8].length <= 0) {
            throw new Error('9rd argument must be a non-empty string');
        }
        if (args[9].length <= 0) {
            throw new Error('10rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let dbsource = args[4];
        let firstCareunit = args[5];
        let lastCareunit = args[6];
        let firstWardid = args[7];
        let lastWardid = args[8];
        let intime = args[9];
        let outtime = args[10];
        let los = args[11];

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(icustayId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + icustayId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'icustay';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.dbsource = dbsource;
        input.firstCareunit = firstCareunit;
        input.lastCareunit = lastCareunit;
        input.firstWardid = firstWardid;
        input.lastWardid = lastWardid;
        input.intime = intime;
        input.outtime = outtime;
        input.los = los;

        // === Save an input to state ===
        await stub.putState(icustayId, Buffer.from(JSON.stringify(input)));
        let indexName = 'icustayId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.icustayId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
       
        console.info('- end init patient icu stay');
    };

    /**
     * Creates a new patient service with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: transfertime. Index 4: prevService. Index 5: currService. 
     */
    async insertService(stub, args) {
        if (args.length !== 6) {
            throw new Error('Incorrect number of arguments. Expecting 6');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient icu stay ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let transfertime = args[3];
        let prevService = args[4];
        let currService = args[5];
        

        // ==== Check if an input already exists ====
        //let inputState = await stub.getState(rowId);
        //if (inputState.toString()) {
            //throw new Error('This input already exists: ' + rowId);
        //}

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'service';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.transfertime = transfertime;
        input.prevService = prevService;
        input.currService = currService;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init patient services');
    };

    /**
     * Creates a new patient transfer with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: dbsource. Index 5: eventtype. Index 6: prevCareunit. 
     * Index 7: currCareunit. Index 8: prevWardid. Index 9: currWardid. Index 10: intime. 
     * Index 11: outtime. Index 12: los. 
     */
    async insertTransfer(stub, args) {
        if (args.length !== 13) {
            throw new Error('Incorrect number of arguments. Expecting 13');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient transfer ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let dbsource = args[4];
        let eventtype = args[5];
        let prevCareunit = args[6];
        let currCareunit = args[7];
        let prevWardid = args[8];
        let currWardid = args[9]; 
        let intime = args[10];
        let outtime = args[12];
        let los = args[13];

        // ==== Check if an input already exists ====
        //let inputState = await stub.getState(rowId);
        //if (inputState.toString()) {
            //throw new Error('This input already exists: ' + rowId);
        //}

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'transfer';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.dbsource = dbsource;
        input.eventtype = eventtype;
        input.prevCareunit = prevCareunit;
        input.currCareunit = currCareunit;
        input.prevWardid = prevWardid;
        input.currWardid = currWardid;
        input.intime = intime;
        input.outtime = outtime;
        input.los = los;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init patient transfer');
    };

    /**
     * Creates a dictionary of cpt with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: category.
     * Index 2: sectionrange. Index 3: sectionheader. Index 4: subsectionrange. Index 5: subsectionheader. 
     * Index 6: codesuffix. Index 7: mincodeinsubsection. Index 8: maxcodeinsubsection.
     */
    async insertDcpt(stub, args) {
        if (args.length !== 9) {
            throw new Error('Incorrect number of arguments. Expecting 9');
        }
        // ==== Input sanitation ====
        console.log('--- start init cpt dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
        if (args[5].length <= 0) {
            throw new Error('6rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let category = args[1];
        let sectionrange = args[2];
        let sectionheader = args[3];
        let subsectionrange = args[4];
        let subsectionheader = args[5];
        let codesuffix = args[6];
        let mincodeinsubsection = args[7];
        let maxcodeinsubsection = args[8];

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_cpt';
        input.rowId = rowId;
        input.category = category;
        input.sectionrange = sectionrange;
        input.sectionheader = sectionheader;
        input.subsectionrange = subsectionrange;
        input.subsectionheader  = subsectionheader;
        input.codesuffix = codesuffix;
        input.mincodeinsubsection = mincodeinsubsection;
        input.maxcodeinsubsection = maxcodeinsubsection;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init cpt dictionary');
    };

    /**
     * Creates a dictionary of icd diagnoses with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: icd9Code.
     * Index 2: shortTitle. Index 3: longTitle.      
     */
    async insertDicdDiagnose(stub, args) {
        if (args.length !== 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        // ==== Input sanitation ====
        console.log('--- start init icd diagnoses dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let icd9Code = args[1];
        let shortTitle = args[2];
        let longTitle = args[3];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(icd9Code);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + icd9Code);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_icd_diagnoses';
        input.rowId = rowId;
        input.icd9Code = icd9Code;
        input.shortTitle = shortTitle;
        input.longTitle = longTitle;
        
        // === Save an input to state ===
        await stub.putState(icd9Code, Buffer.from(JSON.stringify(input)));
        let indexName = 'icd9Code';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.icd9Code]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init icd diagnoses dictionary');
    };

    /**
     * Creates a dictionary of icd procedures with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: icd9Code.
     * Index 2: shortTitle. Index 3: longTitle.      
     */
    async insertDicdProcedure(stub, args) {
        if (args.length !== 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        // ==== Input sanitation ====
        console.log('--- start init icd procedures dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let icd9Code = args[1];
        let shortTitle = args[2];
        let longTitle = args[3];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(icd9Code);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + icd9Code);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_icd_procedures';
        input.rowId = rowId;
        input.icd9Code = icd9Code;
        input.shortTitle = shortTitle;
        input.longTitle = longTitle;
        
        // === Save an input to state ===
        await stub.putState(icd9Code, Buffer.from(JSON.stringify(input)));
        let indexName = 'icd9Code';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.icd9Code]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init icd procedures dictionary');
    };

    /**
     * Creates a dictionary of items with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: itemid.
     * Index 2: label. Index 3: abbreviation. Index 4: dbsource. Index 5: linksto. 
     * Index 6: category. Index 7: unitname. Index 8: paramType. Index 9: conceptid
     */
    async insertDitem(stub, args) {
        if (args.length !== 10) {
            throw new Error('Incorrect number of arguments. Expecting 10');
        }
        // ==== Input sanitation ====
        console.log('--- start init item dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
    
        let rowId = args[0];
        let itemid = args[1];
        let label = args[2];
        let abbreviation = args[3];
        let dbsource = args[4];
        let linksto = args[5];
        let category = args[6];
        let unitname = args[7];
        let paramType = args[8];
        let conceptid = args[9];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(itemid);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + itemid);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_items';
        input.rowId = rowId;
        input.itemid = itemid;
        input.label = label;
        input.abbreviation = abbreviation;
        input.dbsource = dbsource;
        input.linksto = linksto;
        input.category  = category;
        input.unitname = unitname;
        input.paramType = paramType;
        input.conceptid = conceptid;
        
        // === Save an input to state ===
        await stub.putState(itemid, Buffer.from(JSON.stringify(input)));
        let indexName = 'itemid';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.itemid]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init item dictionary');

        return Buffer.from(JSON.stringify(input));
    };

    /**
     * Creates a dictionary of lab items with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: itemid.
     * Index 2: label. Index 3: fluid. Index 4: category. Index 5: loincCode.
     */
    async insertDlabitem(stub, args) {
        if (args.length !== 6) {
            throw new Error('Incorrect number of arguments. Expecting 7');
        }
        // ==== Input sanitation ====
        console.log('--- start init lab item dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let itemid = args[1];
        let label = args[2];
        let fluid = args[3];
        let category = args[4];
        let loincCode = args[5];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(itemid);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + itemid);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_items';
        input.rowId = rowId;
        input.itemid = itemid;
        input.label = label;
        input.fluid = fluid;
        input.category = category;
        input.loincCode = loincCode;
        
        // === Save an input to state ===
        await stub.putState(itemid, Buffer.from(JSON.stringify(input)));
        let indexName = 'itemid';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.itemid]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init lab item dictionary');
    };

    /**
     * Creates a new chart event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: itemid. Index 5: charttime. Index 6: storetime. 
     * Index 7: cgid. Index 8: value. Index 9: valuenum. Index 10: valueuom.
     * Index 11: warning. Index 12: error. Index 13: resultstatus. Index 14: stopped.
     */
    async insertChartevent(stub, args) {
        if (args.length !== 15) {
            throw new Error('Incorrect number of arguments. Expecting 15');
        }
        // ==== Input sanitation ====
        console.log('--- start init chart event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let itemid = args[4];
        let charttime = args[5];
        let storetime = args[6];
        let cgid = args[7];
        let value = args[8];
        let valuenum = args[9];
        let valueuom = args[10];
        let warning = args[11];
        let error = args[12];
        let resultstatus = args[13];
        let stopped = args[14];


        // ==== Check if an input already exists ====
        let inputState = await stub.getState(itemid);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + itemid);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'chartevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.itemid = itemid;
        input.charttime = charttime;
        input.storetime = storetime;
        input.cgid = cgid;
        input.value = value;
        input.valuenum = valuenum;
        input.valueuom = valueuom;
        input.warning = warning;
        input.error = error;
        input.resultstatus = resultstatus;
        input.stopped = stopped;
        
        // === Save an input to state ===
        await stub.putState(itemid, Buffer.from(JSON.stringify(input)));
        let indexName = 'itemid';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [itemid]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init chart event');
    };
    
    /**
    * Creates a new note event with the given attributes.
    * @async
    * @param {ChaincodeStub} stub The chaincode stub.
    * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
    * Index 2: hadmId. Index 3: chartdata. Index 4: charttime. Index 5: storetime. Index 6: category. 
    * Index 7: description. Index 8: cgid. Index 9: iserror. Index 10: text.
    */
   async insertNoteevent(stub, args) {
       if (args.length !== 11) {
           throw new Error('Incorrect number of arguments. Expecting 11');
       }
       // ==== Input sanitation ====
       console.log('--- start init note event ---');
       if (args[0].length <= 0) {
           throw new Error('1st argument must be a non-empty string');
       }
       if (args[1].length <= 0) {
           throw new Error('2nd argument must be a non-empty string');
       }

       let rowId = args[0];
       let subjectId = args[1];
       let hadmId = args[2];
       let chartdata = args[3];
       let charttime = args[4];
       let storetime = args[5];
       let category = args[6];
       let description = args[7];
       let cgid = args[8];
       let iserror = args[9];
       let text = args[10];
       
    //    // ==== Check if an input already exists ====
    //    let inputState = await stub.getState(rowId);
    //    if (inputState.toString()) {
    //        throw new Error('This input already exists: ' + rowId);
    //    }

       // ==== Create an object and marshal to JSON ====
       let input = {};
       input.docType = 'noteevent';
       input.rowId = rowId;
       input.subjectId = subjectId;
       input.hadmId = hadmId;
       input.chartdata = chartdata;
       input.charttime = charttime;
       input.storetime = storetime;
       input.category = category;
       input.description = description;
       input.cgid = cgid;
       input.iserror = iserror;
       input.text = text;
       
       // === Save an input to state ===
       await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
       let indexName = 'rowId';
       let subjectNameIndexKey = await stub.createCompositeKey(indexName, [rowId]);
       console.info(subjectNameIndexKey);
       //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
       //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
       await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
       // ==== Marble saved and indexed. Return success ====
       console.info('- end init note event');
    };

    /**
     * Creates a new cpt event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: costcenter. Index 4: chartdate. Index 5: cptCd. Index 6: cptNumber. 
     * Index 7: cptSuffix. Index 8: ticketIdseq. Index 9: sectionheader. Index 10: subsectionheader.
     * Index 11: description. 
     */
    async insertCptevent(stub, args) {
        if (args.length !== 12) {
            throw new Error('Incorrect number of arguments. Expecting 12');
        }
        // ==== Input sanitation ====
        console.log('--- start init cpt event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let costcenter = args[3];
        let chartdate = args[4];
        let cptCd = args[5];
        let cptNumber = args[6];
        let cptSuffix = args[7];
        let ticketIdseq = args[8];
        let sectionheader = args[9];
        let subsectionheader = args[10];
        let description = args[11];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(cptCd);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + cptCd);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'cptevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.costcenter = costcenter;
        input.chartdate = chartdate;
        input.cptCd = cptCd;
        input.cptNumber = cptNumber;
        input.cptSuffix = cptSuffix;
        input.ticketIdseq = ticketIdseq;
        input.sectionheader = sectionheader;
        input.subsectionheader = subsectionheader;
        input.description = description;
       
        // === Save an input to state ===
        await stub.putState(cptCd, Buffer.from(JSON.stringify(input)));
        let indexName = 'cptCd';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.cptCd]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init cpt event');
    };

    /**
     * Creates a new output event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: charttime. Index 5: itemid. Index 6: value. 
     * Index 7: valueuom. Index 8: storetime. Index 9: cgid. Index 10: stopped.
     * Index 11: newbottle. Index 12: iserror.
     */
    async insertOutputevent(stub, args) {
        if (args.length !== 13) {
            throw new Error('Incorrect number of arguments. Expecting 13');
        }
        // ==== Input sanitation ====
        console.log('--- start init output event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let charttime = args[4];
        let itemid = args[5];
        let value = args[6];
        let valueuom = args[7];
        let storetime = args[8];
        let cgid = args[9];
        let stopped = args[10];
        let newbottle = args[11];
        let iserror = args[12];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'outputevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.charttime = charttime;
        input.itemid = itemid;
        input.value = value;
        input.valueuom = valueuom;
        input.storetime = storetime;
        input.cgid = cgid;
        input.stopped = stopped;
        input.newbottle = newbottle;
        input.iserror = iserror;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init output event');
    };

    /**
     * Creates a new datetime event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: itemid. Index 5: charttime. Index 6: storetime. 
     * Index 7: cgid. Index 8: value. Index 9: valueuom. Index 10: warning.
     * Index 11: error. Index 12: resultstatus. Index 13: stopped. 
     */
    async insertDatetimeevent(stub, args) {
        if (args.length !== 14) {
            throw new Error('Incorrect number of arguments. Expecting 14');
        }
        // ==== Input sanitation ====
        console.log('--- start init datetime event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
        if (args[5].length <= 0) {
            throw new Error('6rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }
        if (args[9].length <= 0) {
            throw new Error('10rd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let subjectId = parseInt(args[1]);
        let hadmId = parseInt(args[2]);
        let icustayId = parseInt(args[3]);
        let itemid = psrdeInt(args[4]);
        let charttime = args[5];
        let storetime = args[6];
        let cgid = parseInt(args[7]);
        let value = args[8];
        let valueuom = args[9].toLowerCase();
        let warning = parseInt(args[10]);
        let error = parseInt(args[11]);
        let resultstatus = args[12].toLowerCase();
        let stopped = args[13].toLowerCase();
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'datetimeevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.itemid = itemid;
        input.charttime = charttime;
        input.storetime = storetime;
        input.cgid = cgid;
        input.value = value;
        input.valueuom = valueuom;
        input.warning = warning;
        input.error = error;
        input.resultstatus = resultstatus;
        input.stopped = stopped;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init datetime event');
    };

    /**
     * Creates a new lab event event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: itemid. Index 4: charttime. Index 5: value. Index 6: valuenum.
     * Index 7: valueuom. Index 8: flag. 
     */
    async insertLabevent(stub, args) {
        if (args.length !== 9) {
            throw new Error('Incorrect number of arguments. Expecting 9');
        }
        // ==== Input sanitation ====
        console.log('--- start init lab event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        
        let rowId = args[0];
        let subjectId = parseInt(args[1]);
        let hadmId = parseInt(args[2]);
        let itemid = psrdeInt(args[3]);
        let charttime = args[4];
        let value = args[5].toLowerCase();
        let valuenum = args[6];
        let valueuom = args[7].toLowerCase();
        let flag = args[8].toLowerCase();
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'labevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.itemid = itemid;
        input.charttime = charttime;
        input.value = value;
        input.valuenum = valuenum;
        input.valueuom = valueuom;
        input.flag = flag;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init lab event');
    };

    /**
     * Creates a new microbiology event with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: chartdate. Index 4: charttime. Index 5: specItemid. Index 6: specTyperDesc. 
     * Index 7: orgItemid. Index 8: orgName. Index 9: isolateNum. Index 10: abItemid.
     * Index 11: abName. Index 12: dilutionText. Index 13: dilutionComparison. Index 14: dilutionValue.
     * Index 15: interpretation. 
     */
    async insertMicrobiologyevent(stub, args) {
        if (args.length !== 16) {
            throw new Error('Incorrect number of arguments. Expecting 16');
        }
        // ==== Input sanitation ====
        console.log('--- start init microbiology event ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
       
        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let chartdate = args[3];
        let charttime = args[4];
        let specItemid = args[5];
        let specTyperDesc = args[6];
        let orgItemid = args[7];
        let orgName = args[8];
        let isolateNum = args[9];
        let abItemid = args[10];
        let abName = args[11];
        let dilutionText = args[12];
        let dilutionComparison = args[13];
        let dilutionValue = args[14];
        let interpretation = args[15];
       
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'microbiologyevent';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.chartdate = chartdate;
        input.charttime = charttime;
        input.specItemid = specItemid;
        input.specTyperDesc = specTyperDesc;
        input.orgItemid = orgItemid;
        input.orgName = orgName;
        input.isolateNum = isolateNum;
        input.abItemid = abItemid;
        input.abName = abName;
        input.dilutionText = dilutionText;
        input.dilutionComparison = dilutionComparison;
        input.dilutionValue = dilutionValue;
        input.interpretation = interpretation;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init microbiology event');
    };


    /**
     * Creates a new drg (diagnosis-related group) code with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: drgType. Index 4: drgCode. Index 5: description. Index 6: drgSeverity. 
     * Index 7: drgMortality.  
     */
    async insertDrgcode(stub, args) {
        if (args.length !== 8) {
            throw new Error('Incorrect number of arguments. Expecting 8');
        }
        // ==== Input sanitation ====
        console.log('--- start init drg code ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[4].length <= 0) {
            throw new Error('5rd argument must be a non-empty string');
        }
       
        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let drgType = args[3];
        let drgCode = args[4];
        let description = args[5];
        let drgSeverity = args[6];
        let drgMortality = args[7];
        

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'drgcode';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.drgType = drgType;
        input.drgCode = drgCode;
        input.description = description;
        input.drgSeverity = drgSeverity;
        input.drgMortality = drgMortality;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init drg code');
    };

    /**
     * Creates a new prescription with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: startdate. Index 5: enddate. Index 6: drugType. 
     * Index 7: drug. Index 8: drugNamePoe. Index 9: drugNameGeneric. Index 10: formularyDrugCd.
     * Index 11: gsn. Index 12: ndc. Index 13: prodStrength. Index 14: doseValRx.
     * Index 15: doseUnitRx. Index 16: formValDisp. Index 17: formUnitDisp. 
     * Index 18: route.
     */
    async insertPrescription(stub, args) {
        if (args.length !== 19) {
            throw new Error('Incorrect number of arguments. Expecting 19');
        }
        // ==== Input sanitation ====
        console.log('--- start init prescription ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let startdate = args[4];
        let enddate = args[5];
        let drugType = args[6];
        let drug = args[7];
        let drugNamePoe = args[8];
        let drugNameGeneric = args[9];
        let formularyDrugCd = args[10];
        let gsn = args[11];
        let ndc = args[12];
        let prodStrength = args[13];
        let doseValRx = args[14];
        let doseUnitRx = args[15];
        let formValDisp = args[16];
        let formUnitDisp = args[17];
        let route = args[18];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(rowId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + rowId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'prescription';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.startdate = startdate;
        input.enddate = enddate;
        input.drugType = drugType;
        input.drug = drug;
        input.drugNamePoe = drugNamePoe;
        input.drugNameGeneric = drugNameGeneric;
        input.formularyDrugCd = formularyDrugCd;
        input.gsn = gsn;
        input.ndc = ndc;
        input.prodStrength = prodStrength;
        input.doseValRx = doseValRx;
        input.doseUnitRx = doseUnitRx;
        input.formValDisp = formValDisp;
        input.formUnitDisp = formUnitDisp;
        input.route = route;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init prescription');

        return Buffer.from(JSON.stringify(input));
    };

    /**
     * Creates a new callout with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: submitWardid. Index 4: submitCareunit. Index 5: currWardid. Index 6: currCareunit. 
     * Index 7: calloutWardid. Index 8: calloutService. Index 9: requestTele. Index 10: requestResp.
     * Index 11: requestCdiff. Index 12: requestMrsa. Index 13: requestVre. Index 14: calloutStatus.
     * Index 15: calloutOutcome. Index 16: dischargeWardid. Index 17: acknowlegdeStatus. 
     * Index 18: creattime. Index 19: updatetime. Index 20: acknowledgetime. Index 21: outcometime.
     * Index 22: firstreservationtime. Index 23: currentreservationtime.
     */
    async insertCallout(stub, args) {
        if (args.length !== 24) {
            throw new Error('Incorrect number of arguments. Expecting 24');
        }
        // ==== Input sanitation ====
        console.log('--- start init callout ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[8].length <= 0) {
            throw new Error('9rd argument must be a non-empty string');
        }
        if (args[9].length <= 0) {
            throw new Error('10rd argument must be a non-empty string');
        }
        if (args[10].length <= 0) {
            throw new Error('11rd argument must be a non-empty string');
        }
        if (args[11].length <= 0) {
            throw new Error('12rd argument must be a non-empty string');
        }
        if (args[12].length <= 0) {
            throw new Error('13rd argument must be a non-empty string');
        }
        if (args[13].length <= 0) {
            throw new Error('14rd argument must be a non-empty string');
        }
        if (args[14].length <= 0) {
            throw new Error('15rd argument must be a non-empty string');
        }
        if (args[15].length <= 0) {
            throw new Error('16rd argument must be a non-empty string');
        }
        if (args[17].length <= 0) {
            throw new Error('18rd argument must be a non-empty string');
        }
        if (args[18].length <= 0) {
            throw new Error('19rd argument must be a non-empty string');
        }
        if (args[19].length <= 0) {
            throw new Error('20rd argument must be a non-empty string');
        }
        if (args[21].length <= 0) {
            throw new Error('22rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let submitWardid = args[3];
        let submitCareunit = args[4];
        let currWardid = args[5];
        let currCareunit = args[6];
        let calloutWardid = args[7];
        let calloutService = args[8];
        let requestTele = args[9];
        let requestResp = args[10];
        let requestCdiff = args[11];
        let requestMrsa = args[12];
        let requestVre = args[13];
        let calloutStatus = args[14];
        let calloutOutcome = args[15];
        let dischargeWardid = args[16];
        let acknowlegdeStatus = args[17];
        let creattime = args[18];
        let updatetime = args[19];
        let acknowledgetime = args[20];
        let outcometime = args[21];
        let firstreservationtime = args[22];
        let currentreservationtime = args[23];

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'callout';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.submitWardid = submitWardid;
        input.submitCareunit = submitCareunit;
        input.currWardid = currWardid;
        input.currCareunit = currCareunit;
        input.calloutWardid = calloutWardid;
        input.calloutService = calloutService;
        input.requestTele = requestTele;
        input.requestResp = requestResp;
        input.requestCdiff = requestCdiff;
        input.requestMrsa = requestMrsa;
        input.requestVre = requestVre;
        input.calloutStatus = calloutStatus;
        input.calloutOutcome = calloutOutcome;
        input.dischargeWardid = dischargeWardid;
        input.acknowlegdeStatus = acknowlegdeStatus;
        input.creattime = creattime;
        input.updatetime = updatetime;
        input.acknowledgetime = acknowledgetime;
        input.outcometime = outcometime;
        input.firstreservationtime = firstreservationtime;
        input.currentreservationtime = currentreservationtime;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init callout');
    };

    /**
     * Creates a new caregiver with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: cgid.
     * Index 2: label. Index 3: description. 
     */
    async insertCaregiver(stub, args) {
        if (args.length !== 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        // ==== Input sanitation ====
        console.log('--- start init caregiver ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
       
        let rowId = args[0];
        let cgid = args[1];
        let label = args[2];
        let description = args[3];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(cgid);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + cgid);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'caregiver';
        input.rowId = rowId;
        input.cgid = cgid;
        input.label = label;
        input.description = description;
        
        // === Save an input to state ===
        await stub.putState(cgid, Buffer.from(JSON.stringify(input)));
        let indexName = 'cgid';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.cgid]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init caregiver');
    };

    /**
     * Creates a new diagnose icd with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hamId. Index 3: seqNum. Index 4: icd9Code. 
     */
    async insertDiagnoseIcd(stub, args) {
        if (args.length !== 5) {
            throw new Error('Incorrect number of arguments. Expecting 5');
        }
        // ==== Input sanitation ====
        console.log('--- start init diagnose icd ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3nd argument must be a non-empty string');
        }
       
        let rowId = args[0];
        let subjectId = args[1];
        let hamId = args[2];
        let seqNum = args[3];
        let icd9Code = args[4];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'diagnoseIcd';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hamId = hamId;
        input.seqNum = seqNum;
        input.icd9Code = icd9Code;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init diagnose icd');
    };

    /**
     * Creates a new procedures icd with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hamId. Index 3: seqNum. Index 4: icd9Code. 
     */
    async insertProcedureIcd(stub, args) {
        if (args.length !== 5) {
            throw new Error('Incorrect number of arguments. Expecting 5');
        }
        // ==== Input sanitation ====
        console.log('--- start init procedure icd ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3nd argument must be a non-empty string');
        }
       
        let rowId = args[0];
        let subjectId = args[1];
        let hamId = args[2];
        let seqNum = args[3];
        let icd9Code = args[4];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'procedureIcd';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hamId = hamId;
        input.seqNum = seqNum;
        input.icd9Code = icd9Code;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init procedure icd');
    };

    /**
     * Creates a new input event mv with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: starttime. Index 5: endtime. Index 6: itemid. 
     * Index 7: amount. Index 8: amountuom. Index 9: rate. Index 10: rateuom.
     * Index 11: storetime. Index 12: cgid. Index 13: orderid. Index 14: linkorderid.
     * Index 15: ordercategoryname. Index 16: secondarycategoryname. Index 17: ordercomponenttypedescription. 
     * Index 18: ordercategorydescription. Index 19: patientweight. Index 20: totalamount. Index 21: totalamountuom.
     * Index 22: isopenbag. Index 23: continueinnextdept. Index 24: cancelreason. Index 25: statusdescription.
     * Index 26: commentsEditedby. Index 27: commentsCanceledby. Index 28: commentsDate. 
     * Index 29: originalamount. Index 30: originalrate. 
     */
    async insertInputeventMv(stub, args) {
        if (args.length !== 31) {
            throw new Error('Incorrect number of arguments. Expecting 31');
        }
        // ==== Input sanitation ====
        console.log('--- start init input event mv ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let starttime = args[4]
        let endtime = args[5];
        let itemid = args[6];
        let amount = args[7];
        let amountuom = args[8];
        let rate = args[9];
        let rateuom = args[10];
        let storetime = args[11];
        let cgid = args[12];
        let orderid = args[13];
        let linkorderid = args[14];
        let ordercategoryname = args[15];
        let secondarycategoryname = args[16];
        let ordercomponenttypedescription = args[17];
        let ordercategorydescription = args[18];
        let patientweight = args[19];
        let totalamount = args[20];
        let totalamountuom = args[21];
        let isopenbag = args[22];
        let continueinnextdept = args[23];
        let cancelreason = args[24];
        let statusdescription = args[25];
        let commentsEditedby = args[26];
        let commentsCanceledby = args[27];
        let commentsDate = args[28];
        let originalamount = args[29];
        let originalrate = args[30];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(rowId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + rowId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'inputeventmv';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.starttime = starttime;
        input.endtime = endtime;
        input.itemid = itemid;
        input.amount = amount;
        input.amountuom = amountuom;
        input.rate = rate;
        input.rateuom = rateuom;
        input.storetime = storetime;
        input.cgid = cgid;
        input.orderid = orderid;
        input.linkorderid = linkorderid;
        input.ordercategoryname = ordercategoryname;
        input.secondarycategoryname = secondarycategoryname;
        input.ordercomponenttypedescription = ordercomponenttypedescription;
        input.ordercategorydescription = ordercategorydescription;
        input.patientweight = patientweight;
        input.totalamount = totalamount;
        input.totalamountuom = totalamountuom;
        input.isopenbag = isopenbag;
        input.continueinnextdept = continueinnextdept;
        input.cancelreason = cancelreason;
        input.statusdescription = statusdescription;
        input.commentsEditedby = commentsEditedby;
        input.commentsCanceledby = commentsCanceledby;
        input.commentsDate = commentsDate;
        input.originalamount = originalamount;
        input.originalrate = originalrate; 

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init input event mv');

        return Buffer.from(JSON.stringify(input));
    };

    /**
     * Creates a new input event cv with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: charttime. Index 5: itemid. Index 6: amount. 
     * Index 7: amountuom. Index 8: rate. Index 9: rateuom. Index 10: storetime.
     * Index 11: cgid. Index 12: orderid. Index 13: linkorderid. Index 14: stopped.
     * Index 15: newbottle. Index 16: originalamountuom. Index 17: originalroute. 
     * Index 18: originalrate. Index 19: originalrateuom. Index 20: originalsite. 
     */
    async insertInputeventCv(stub, args) {
        if (args.length !== 21) {
            throw new Error('Incorrect number of arguments. Expecting 21');
        }
        // ==== Input sanitation ====
        console.log('--- start init input event cv ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let charttime = args[4]
        let itemid = args[5];
        let amount = args[6];
        let amountuom = args[7];
        let rate = args[8];
        let rateuom = args[9];
        let storetime = args[10];
        let cgid = args[11];
        let orderid = args[12];
        let linkorderid = args[13];
        let stopped = args[14];
        let newbottle = args[15];
        let originalamountuom = args[16];
        let originalroute = args[17];
        let originalrate = args[18];
        let originalrateuom = args[19];
        let originalsite = args[20];
        
        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'inputeventcv';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.charttime = charttime;
        input.itemid = itemid;
        input.amount = amount;
        input.amountuom = amountuom;
        input.rate = rate;
        input.rateuom = rateuom;
        input.storetime = storetime;
        input.cgid = cgid;
        input.orderid = orderid;
        input.linkorderid = linkorderid;
        input.stopped = stopped;
        input.newbottle = newbottle;
        input.originalamountuom = originalamountuom;
        input.originalroute = originalroute;
        input.originalrate = originalrate; 
        input.originalrateuom = originalrateuom;
        input.originalsite = originalsite;
        
        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init input event cv');
    };

    /**
     * Creates a new procedure event mv with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: starttime. Index 5: endtime. Index 6: itemid. 
     * Index 7: value. Index 8: valueuom. Index 9: location. Index 10: locationcategory.
     * Index 11: storetime. Index 12: cgid. Index 13: orderid. Index 14: linkorderid.
     * Index 15: ordercategoryname. Index 16: secondaryordercategoryname. Index 17: ordercategorydescription. 
     * Index 18: isopenbag. Index 19: continueinnextdept. Index 20: cancelreason. Index 21: statusdescription.
     * Index 22: commentsEditedby. Index 23: commentsCanceledby. Index 24: commentsDate. 
     */
    async insertProcedureeventMv(stub, args) {
        if (args.length !== 25) {
            throw new Error('Incorrect number of arguments. Expecting 25');
        }
        // ==== Input sanitation ====
        console.log('--- start init procedure event mv ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3nd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let starttime = args[4]
        let endtime = args[5];
        let itemid = args[6];
        let value = args[7];
        let valueuom = args[8];
        let location = args[9];
        let locationcategory = args[10];
        let storetime = args[11];
        let cgid = args[12];
        let orderid = args[13];
        let linkorderid = args[14];
        let ordercategoryname = args[15];
        let secondaryordercategoryname = args[16];
        let ordercategorydescription = args[17];
        let isopenbag = args[18];
        let continueinnextdept = args[19];
        let cancelreason = args[20];
        let statusdescription = args[21];
        let commentsEditedby = args[22];
        let commentsCanceledby = args[23];
        let commentsDate = args[24];

        // ==== Check if an input already exists ====
        let inputState = await stub.getState(rowId);
        if (inputState.toString()) {
            throw new Error('This input already exists: ' + rowId);
        }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'procedureeventmv';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.starttime = starttime;
        input.endtime = endtime;
        input.itemid = itemid;
        input.value = value;
        input.valueuom = valueuom;
        input.location = location;
        input.locationcategory = locationcategory;
        input.storetime = storetime;
        input.cgid = cgid;
        input.orderid = orderid;
        input.linkorderid = linkorderid;
        input.ordercategoryname = ordercategoryname;
        input.secondaryordercategoryname = secondaryordercategoryname;
        input.ordercategorydescription = ordercategorydescription;
        input.isopenbag = isopenbag;
        input.continueinnextdept = continueinnextdept;
        input.cancelreason = cancelreason;
        input.statusdescription = statusdescription;
        input.commentsEditedby = commentsEditedby;
        input.commentsCanceledby = commentsCanceledby;
        input.commentsDate = commentsDate;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init procedure event mv');
    };

    /**
    * Gets the results of a specified iterator.* @async
    * @param {Object} iterator The iterator to use.
    * @param {Boolean} isHistory Specifies whether the iterator returns history entries or not.
    * @return {Promise<Object[]>} The array of results in JSON format.
    */
    async getAllResults(iterator, isHistory) {
       let allResults = [];
       let hasNext = true;
        while (hasNext) {
           let res;
           try {
               res = await iterator.next();
            } catch (err) {
               hasNext = false;
               continue;
            }

            if (res.value && res.value.value.toString()) {
               let jsonRes = {};
               console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                   jsonRes.TxId = res.value.tx_id;
                   jsonRes.Timestamp = res.value.timestamp;
                   jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                       jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                       console.log(err);
                       jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                   jsonRes.Key = res.value.key;
                    try {
                       jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                       console.log(err);
                       jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
               console.log('end of data');
               await iterator.close();
               console.info(allResults);
               return allResults;
            }
        }
    }
   
   /**
    * Executes the provided query string.
    * Result set is built and returned as a byte array containing the JSON results.
    * @async
    * @param {ChaincodeStub} stub The chaincode stub.
    * @param {String} queryString The query string to execute.
    * @param {Chaincode} thisObject The chaincode object context.
    * @return {Promise<Buffer>} The results of the specified query.
    */
    async getQueryResultForQueryString(stub, queryString, thisObject) {

       console.info('- getQueryResultForQueryString queryString:\n' + queryString);
       let resultsIterator = await stub.getQueryResult(queryString);

       let results = await thisObject.getAllResults(resultsIterator, false);

       return Buffer.from(JSON.stringify(results));
    }

    /**
     * Queries for patient based on a passed id.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: patient id.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The patient of the specified id.
     */
    async queryPatientById(stub, args, thisClass) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting patient id.');
        }

        let subjectId  = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patients';
        queryString.selector.subjectId = subjectId;
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);

        return queryResults;
    }

    /**
     * Retrieves the information about a patient.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: subejctId.
     * @return {Promise<Object[]>} The byte representation of the marble.
     */
     async readPatient(stub, args) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting subjectId');
        }

        //let docType = args[0];
        let subjectId = args[0];
        if (!subjectId) {
            throw new Error('Patient id must not be empty');
        }
        // let docTypeResultsIterator = await stub.getStateByPartialCompositeKey('docType~subjectId', [docType]); 
        
        // //let method = thisClass['transferMarble'];
        // // Iterate through result set and for each marble found, transfer to newOwner
        // //while (true) {
        // let responseRange = await docTypeResultsIterator;
        // if (!responseRange || !responseRange.value || !responseRange.value.key) {
        //     return;
        // }
        // // console.log(responseRange.value.key);

        // // // let value = res.value.value.toString('utf8');
        // let objectType;
        // let attributes;
        // ({
        //     objectType,
        //     attributes
        // } = await stub.splitCompositeKey(responseRange.value.key));

        // return Buffer.from(JSON.stringify(responseRange));

        //let returneddocType = attributes[0];
        //let returnedsubjectId = attributes[1];
        //console.info(util.format('- found a marble from index:%s color:%s name:%s\n', objectType, returneddocType, returnedsubjectId));

            // Now call the transfer function for the found marble.
            // Re-use the same function that is used to transfer individual marbles
            //let response = await method(stub, [returnedMarbleName, newOwner]);
        //}

        let patientAsBytes = await stub.getState(subjectId);
        if (!patientAsBytes.toString()) {
            let jsonResp = {};
            jsonResp.Error = 'Patient does not exist: ' + subjectId;
            throw new Error(JSON.stringify(jsonResp));
        }
        console.info('=======================================');
        console.log(patientAsBytes.toString());
        console.info('=======================================');
        return patientAsBytes;

        //return docTypeResultsIterator;
    }

    /**
     * Queries for note based on a passed category.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: patient id.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The patient of the specified id.
     */
    async queryNoteeventbyCategory(stub, args, thisClass) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting patient id.');
        }

        let subjectId  = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patients';
        queryString.selector.subjectId = subjectId;
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);

        return queryResults;
    }

    async doNothing(stub, params) {
        return;
    }

    /**
     * Retrieves the history for a patient.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: patient id.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The history entries of the specified patient.
     */
    async getHistoryForPatient(stub, args, thisObject) {

        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        let id = args[0];
        console.info('- start getHistoryForPatient: %s\n', id);

        let resultsIterator = await stub.getHistoryForKey(id);
        let results = await thisObject.getAllResults(resultsIterator, true);

        console.info('=======================================');
        console.log(results.toString());
        console.info('=======================================');

        return Buffer.from(JSON.stringify(results));
    }

     // ===========================================================
    // transfer a marble by setting a new owner name on the marble
    // ===========================================================
    /**
     * Transfers the given marble to a new owner.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: marble name. Index 1: the new owner.
     */
    async changeGender(stub, args) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting patient id');
        }

        let id = args[0];
        console.info('- start changeGender', id);

        let patientAsBytes = await stub.getState(id);
        if (!patientAsBytes || !patientAsBytes.toString()) {
            throw new Error('patient does not exist');
        }
        let patientToTransfer = {};
        try {
            patientToTransfer = JSON.parse(patientAsBytes.toString()); //unmarshal
        } catch (err) {
            let jsonResp = {};
            jsonResp.error = 'Failed to decode JSON of: ' + id;
            throw new Error(jsonResp);
        }
        console.info(patientToTransfer);
        patientToTransfer.gender = '"G"'; //change the ownerlet marbleJSONasBytes = Buffer.from(JSON.stringify(marbleToTransfer));
        await stub.putState(id, patientAsBytes); //rewrite the marble

        console.info('- end changeGender (success)');
    }

    /**MARBLES FUNCTION**/
    /*
    *
    */

    /**
     * Deletes the given marble.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: marble name.
     */
    async delete(stub, args) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the marble to delete');
        }
        let marbleName = args[0];
        if (!marbleName) {
            throw new Error('marble name must not be empty');
        }
        // to maintain the color~name index, we need to read the marble first and get its color
        let valAsBytes = await stub.getState(marbleName); //get the marble from chaincode state
        let jsonResp = {};
        if (!valAsBytes) {
            jsonResp.error = 'marble does not exist: ' + marbleName;
            throw new Error(jsonResp);
        }
        let marbleJSON = {};
        try { marbleJSON = JSON.parse(valAsBytes.toString());
        } catch (err) {
            jsonResp = {};
            jsonResp.error = 'Failed to decode JSON of: ' + marbleName;
            throw new Error(jsonResp);
        }

        await stub.deleteState(marbleName); //remove the marble from chaincode state

        // delete the index
        let indexName = 'color~name';
        let colorNameIndexKey = stub.createCompositeKey(indexName, [marbleJSON.color, marbleJSON.name]);
        if (!colorNameIndexKey) {
            throw new Error(' Failed to create the createCompositeKey');
        }
        //  Delete index entry to state.
        await stub.deleteState(colorNameIndexKey);
    }


    /**
     * Performs a range query based on the start and end keys provided.
     *
     * Read-only function results are not typically submitted to ordering. If the read-only
     * results are submitted to ordering, or if the query is used in an update transaction
     * and submitted to ordering, then the committing peers will re-execute to guarantee that
     * result sets are stable between endorsement time and commit time. The transaction is
     * invalidated by the committing peers if the result set has changed between endorsement
     * time and commit time.
     * Therefore, range queries are a safe option for performing update transactions based on query results.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: start key. Index 1: end key.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The marbles in the given range.
     */
    async getMarblesByRange(stub, args, thisObject) {

        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting 2');
        }

        let startKey = args[0];
        let endKey = args[1];

        let resultsIterator = await stub.getStateByRange(startKey, endKey);
        let results = await thisObject.getAllResults(resultsIterator, false);

        return Buffer.from(JSON.stringify(results));
    }

    /**
     * Transfers marbles of a given color to a certain new owner.
     *
     * Uses a GetStateByPartialCompositeKey (range query) against color~name 'index'.
     * Committing peers will re-execute range queries to guarantee that result sets are stable
     * between endorsement time and commit time. The transaction is invalidated by the
     * committing peers if the result set has changed between endorsement time and commit time.
     * Therefore, range queries are a safe option for performing update transactions based on query results.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: marble color. Index 1: new owner.
     * @param {Chaincode} thisObject The chaincode object context.
     */async transferMarblesBasedOnColor(stub, args, thisObject) {
        if (args.length !== 2) {
            throw new Error('Incorrect number of arguments. Expecting color and owner');
        }

        let color = args[0];
        let newOwner = args[1].toLowerCase();
        console.info('- start transferMarblesBasedOnColor ', color, newOwner);

        // Query the color~name index by color
        // This will execute a key range query on all keys starting with 'color'
        let coloredMarbleResultsIterator = await stub.getStateByPartialCompositeKey('color~name', [color]);

        let hasNext = true;
        // Iterate through result set and for each marble found, transfer to newOwner
        while (hasNext) {
            let responseRange;
            try {
                responseRange = await coloredMarbleResultsIterator.next();
            } catch (err) {
                hasNext = false;
                continue;
            }

            if (!responseRange || !responseRange.value || !responseRange.value.key) {
                return;
            }
            console.log(responseRange.value.key);

            // let value = res.value.value.toString('utf8');
            let objectType;
            let attributes;
            ({
                objectType,
                attributes
            } = await stub.splitCompositeKey(responseRange.value.key));

            let returnedColor = attributes[0];
            let returnedMarbleName = attributes[1];
            console.info(util.format('- found a marble from index:%s color:%s name:%s\n', objectType, returnedColor, returnedMarbleName));

            // Now call the transfer function for the found marble.
            // Re-use the same function that is used to transfer individual marbles
            await thisObject.transferMarble(stub, [returnedMarbleName, newOwner]);
        }

        let responsePayload = util.format('Transferred %s marbles to %s', color, newOwner);
        console.info('- end transferMarblesBasedOnColor: ' + responsePayload);
    }

    /**
     * Uses a query string to perform a query for marbles.
     * Query string matching state database syntax is passed in and executed as is.
     * Supports ad hoc queries that can be defined at runtime by the client.
     * If this is not desired, follow the queryMarblesForOwner example for parameterized queries.
     * Only available on state databases that support rich query (e.g. CouchDB)
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: query string.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The results of the specified query.
     */
    async queryMarbles(stub, args, thisObject) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting queryString');
        }
        let queryString = args[0];
        if (!queryString) {
            throw new Error('queryString must not be empty');
        }

        return await thisObject.getQueryResultForQueryString(stub, queryString, thisObject);
    }


    /**
     * Retrieves the history for a marble.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: marble name.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The history entries of the specified marble.
     */
    async getHistoryForMarble(stub, args, thisObject) {

        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        let marbleName = args[0];
        console.info('- start getHistoryForMarble: %s\n', marbleName);

        let resultsIterator = await stub.getHistoryForKey(marbleName);
        let results = await thisObject.getAllResults(resultsIterator, true);

        return Buffer.from(JSON.stringify(results));
    }
};

shim.start(new Chaincode());
