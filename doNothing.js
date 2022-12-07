'use strict';

module.exports.info  = 'doNothing';

let bc, contx;

module.exports.init = function(blockchain, context, args) {

    bc       = blockchain;
    contx    = context;

    return Promise.resolve();
};

module.exports.run = function() {

    if (bc.getType() === 'fabric') {
        let args = {
            chaincodeFunction: 'doNothing',
            chaincodeArguments: [],
        };

        return bc.bcObj.invokeSmartContract(contx, 'testecouch', 'v0', args, 10000);
    }
};

module.exports.end = function() {
    // do nothing
    return Promise.resolve();
};
