// 'use strict';
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');



// CONSTRUCT THE BLOCK
class Block {
    constructor(index, transactions=[], difficulty, minedBy, blockDataHash, blockHash, nonce,  timestamp, previousBlockHash) {
        this.index = index;
        this.transactions = transactions;
        this.difficulty = difficulty;
        this.minedBy = minedBy.toString();
        this.blockDataHash = blockDataHash.toString();
        this.blockHash = blockHash.toString();
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.previousBlockHash = previousBlockHash.toString();
    }
}

var genesisBlock = () => {
    return new Block(0, [{"from" : "0000000000000000000000000000000000000000",
    "to" : "84ede81c58f5c490fc6e1a3035789eef897b5b35",
    "value" : 5000020,
    "fee" : 0,
    "dateCreated" : "2023-04-04T13:01:04.969Z",
    "data" : "coinbase tx", "senderPubKey" :
    "00000000000000000000000000000000000000000000000000000000000000000",
    "transactionDataHash" :
    "b68df93232251cc0773bf384b3f90fafaeab0097e7e060f31f5fa413939e4dfa",
    "senderSignature" : [
    "0000000000000000000000000000000000000000000000000000000000000000",
    "0000000000000000000000000000000000000000000000000000000000000000"
    ],
    "minedInBlockIndex" : 1,
    "transferSuccessful" : true}], "0", "0000000000000000000000000000000000000000", )
}

var calculateHash = (index, previousHash, timestamp, data, nonce) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString();
};

var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
};


// TEST APPLICATIONS FUNCTIONALITY
function testApplication() {
    function showBlockchain(inputBlockchain) {
        for (let i = 0; i < inputBlockchain.length; i++) {
            console.log(inputBlockchain[i]);
        }
        console.log();
    }
    showBlockchain(blockchain);
    // console.log(calculateHashForBlock(genesisBlock()));
}

testApplication();
