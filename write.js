'use strict';

module.exports.info = 'write new value';

let bc, contx;

module.exports.init = function (blockchain, context, args) {

    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = function () {

    let key = '235';
    let args;

    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'changeGender',
            chaincodeArguments: [key],
        };
    } 

    return bc.invokeSmartContract(contx, 'testecouch', 'v0', args, 100);

};

module.exports.end = function () {
    // do nothing
    return Promise.resolve();
};
