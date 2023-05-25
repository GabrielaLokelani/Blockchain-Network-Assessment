'use strict';
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');


// CONSTRUCT THE BLOCK (if broken, take out transactions)
class Block {
    constructor(index, transactions, data, difficulty, minedBy, blockDataHash, nonce, timestamp, previousBlockHash) {
        this.index = index;
        this.transactions = transactions;
        this.data = data;
        this.difficulty = difficulty;
        this.minedBy = minedBy.toString();
        this.blockDataHash = blockDataHash;
        this.blockHash = this.calculateBlockHash();
        this.nonce = nonce;
        this.timestamp = timestamp;
        this.previousBlockHash = previousBlockHash.toString();
    }

    // calculateHash() {
    //     return CryptoJS.SHA256(this.index + JSON.stringify(this.data) + this.difficulty + this.minedBy + this.nonce + this.timestamp + this.previousHash).toString();
    // }

    calculateBlockHash() {
        return CryptoJS.SHA256(this.blockDataHash + this.nonce).toString();
    }
}

// TRANSACTION (*** simplified for now, add extra params later ***)
class Transaction {
    constructor(from, to, value, fee, dateCreated, data) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.fee = fee;
        this.dateCreated = dateCreated;
        this.data = data;
    }
}


// CREATE GENESIS BLOCK MANUALLY
function createGenesisBlock() {
    return new Block(0, "Genesis block of simple chain Miewww", 0, "0000000000000000000000000000000000000000", 'bc8365c345ee2620ca7df55e7383210c14ebb3d84eba7b8fc5b2b381f260fe01', 0, "2023-14-4 00:00:00", "");
}

// CREATE BLOCKCHAIN ARRAY INSTANCE AND PUT GENESIS BLOCK IN IT MANUALLY
var blockchain = [createGenesisBlock()];

// GET LATEST BLOCK IN THE CHAIN
function getLatestBlock() {
    return blockchain[blockchain.length - 1];
}

function calculateHash(index, data, minedBy, nonce, timestamp, previousBlockHash) {
    return CryptoJS.SHA256(index + JSON.stringify(data) + minedBy + nonce + timestamp + previousBlockHash).toString();
}

function calculateHashForBlock(block) {
    return calculateHash(block.index, block.data, block.minedBy, block.nonce, block.timestamp, block.previousBlockHash);
}

// MINE THE NEXT BLOCK
function mineNextBlock(blockData, difficulty, minedBy) {
    var previousBlock = getLatestBlock();
    var newIndex = previousBlock.index + 1;
    var nonce = 0;
    var newTimestamp = new Date();
    var nextHash = calculateHash(newIndex, blockData, minedBy, nonce, newTimestamp, previousBlock.blockHash);
    console.log('\n MINING IN PROGRESS...')
    while (nextHash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
        nonce++;
        var newTimestamp = new Date();
        var nextHash = calculateHash(newIndex, blockData, minedBy, nonce, newTimestamp, previousBlock.blockHash);

        console.log('\'index\':' + newIndex + ',\'previousHash\':' + previousBlock.blockHash + 
                    '\'timestamp\':' + newTimestamp + '\'data\':' + blockData + 
                    ',\x1b[33mhash: ' + nextHash + ' \x1b[0m,' + '\'difficulty\':' + difficulty + 
                    ',\x1b[33mnonce: ' + nonce + ' \x1b[0m ');        
    }
    return new Block(newIndex, blockData, difficulty, minedBy, nextHash, nonce, newTimestamp, previousBlock.blockHash)
}

// SEE IF NEW BLOCK IS VALID
function isValidNewBlock(newBlock, previousBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index!');
        return false;
    } else if (previousBlock.blockHash !== newBlock.previousBlockHash) {
        console.log('invalid previous hash!');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.blockDataHash) {
        console.log(typeof (newBlock.blockDataHash) + " " + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.blockDataHash);
        return false;
    }
    return true;
}

// ADD BLOCK TO THE CHAIN
function addBlock(newBlock) {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
}

// SEE IF THE CHAIN IS VALID
function isValidBlockchain(blockchain) {
    if (JSON.stringify(blockchain[0]) !== JSON.stringify(createGenesisBlock())) {
        return false;
    }
    let tempBlocks = [blockchain[0]];
    for (let i = 1; i < blockchain.length; i++) {
        if (isValidNewBlock(blockchain[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchain[i]);
        } else {
            return false;
        }
    }
    return true;
}

// REPLACE THE INVALID IMPOSTER CHAIN!
function replaceImposterChain(newBlocks) {
    if (isValidBlockchain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('The recieved blockchain is valid! Replacing the current chain with the recieved chain.');
        blockchain = newBlocks;
    } else {
        console.log('Recieved chain is not valid!');
    }
}


// TEST APPLICATIONS FUNCTIONALITY
function testApplication() {
    function showBlockchain(inputBlockchain) {
        for (let i = 0; i < inputBlockchain.length; i++) {
            console.log(inputBlockchain[i]);
        }
        console.log();
    }

    // showBlockchain(blockchain);

    // ADD BLOCK TESTING
    console.log('blockchain before addBlock() execution: ');
    showBlockchain(blockchain);
    console.log("Mining block 1...");
    addBlock(mineNextBlock('testing new block data', 2, "0000000000000000000000000000000000000000"));
    console.log('\n');
    console.log("Mining block 2...");
    addBlock(mineNextBlock('testing new block data... again!', 2, "0000000000000000000000000000000000000000"));
    console.log('\n');
    console.log('Blockchain after the addBlock() execution: ');
    showBlockchain(blockchain)
}

testApplication();



// class BlockChain {
//     constructor() {
//         this.chain = [this.createGenesisBlock()];
//     }

//     createGenesisBlock() {
//         return new Block(0, "Genesis block of simple chain Miewww", 0, "0000000000000000000000000000000000000000", 0, "2023-14-4 00:00:00", "");
//     }

//     getLatestBlock() {
//         return this.chain[this.chain.length - 1];
//     }
    
//     addBlock(newBlock) {
//         // The previous hash value of the new block is the hash value of the last block of the existing blockchain；
//         newBlock.previousHash = this.getLatestBlock().blockHash;
//         // Recalculate the hash value of the new block (because the previousHash is specified)；
//         newBlock.blockHash = newBlock.calculateHash(); 
//         //Add new blocks to the chain；
//         this.chain.push(newBlock); 
//     }

//     isChainValid() {
//         //Traverse all the blocks
//         for (let i = 1; i < this.chain.length; i++) {
//             const currentBlock = this.chain[i];
//             const previousBlock = this.chain[i - 1];
//             //Recalculate the has value of the current block. If the hash value is not matched, it indicates that data of the block was changed without permission, and therefore the has value is not recalculated.
//             if (currentBlock.blockHash !== currentBlock.calculateHash()) {
//                 console.error("hash not equal: " + JSON.stringify(currentBlock));
//                 return false;
//             }
//             // Determine whether the previousHash of the current block is equal to the hash of the previous block. If they are not equal to each other, this means that the previous block was changed without permission. Although the hash value is recalculated correctly, the hash value of the subsequent block is not recalculated, resulting the the whole chain breaking.
//             if (currentBlock.previousHash !== previousBlock.calculateHash) {
//                 console.error("previous hash not right: " + JSON.stringify(currentBlock));
//                 return false;
//             }
//         }
//         return true;
//     }
// }

// let beginningChain = new BlockChain();
// beginningChain.addBlock(new Block("2023-14-4 00:00:01", {amount: 10}));
// beginningChain.addBlock(new Block("2023-14-4 00:00:02", {amount: 20}));

// console.log(JSON.stringify(simpleChain, null, 4));

// console.log("is the chain valid? " + simpleChain.isChainValid())

// var genesisBlock = () => {
//     return new Block(0, [{"from" : "0000000000000000000000000000000000000000",
//     "to" : "84ede81c58f5c490fc6e1a3035789eef897b5b35",
//     "value" : 5000020,
//     "fee" : 0,
//     "dateCreated" : "2023-04-04T13:01:04.969Z",
//     "data" : "coinbase tx", "senderPubKey" :
//     "00000000000000000000000000000000000000000000000000000000000000000",
//     "transactionDataHash" :
//     "b68df93232251cc0773bf384b3f90fafaeab0097e7e060f31f5fa413939e4dfa",
//     "senderSignature" : [
//     "0000000000000000000000000000000000000000000000000000000000000000",
//     "0000000000000000000000000000000000000000000000000000000000000000"
//     ],
//     "minedInBlockIndex" : 1,
//     "transferSuccessful" : true}], "0", "0000000000000000000000000000000000000000", )
// }