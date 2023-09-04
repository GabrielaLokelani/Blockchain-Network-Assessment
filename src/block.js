
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

// create the block class which each new block will follow
export default class Block {
    constructor(index, transactions, difficulty, minedBy, previousBlockHash) {
        this.index = index;
        this.transactions = transactions;
        this.difficulty = difficulty;
        this.previousBlockHash = previousBlockHash.toString();
        this.minedBy = minedBy.toString();
        this.blockDataHash = this.calculateBlockDataHash();
        // this.nonce = 0;
        // this.dateCreated = dateCreated;
        // this.blockHash = this.calculateBlockHash();
    }

    // calculate the block DATA hash using SHA256
    calculateBlockDataHash() {
        return CryptoJS.SHA256(this.index + JSON.stringify(this.transactions) + this.difficulty + this.previousBlockHash + this.minedBy).toString();
    }

    // calculate the block hash using SHA256 which takes the blockDataHash, dateCreated, and nonce
    calculateBlockHash() {
        return CryptoJS.SHA256(this.blockDataHash + this.dateCreated + this.nonce).toString();
    }

    // check the validity of each transaction in the block and make sure there are no missing values
    checkTransactionsValidity() {
        for (const txn of this.transactions) {
        if (!txn.from || !txn.to || !txn.value || !txn.fee || !txn.data || !txn.senderPubkey) {
            throw new Error('Sorry! Transaction is missing a value.');
        } else {
            return true;
        }
        }
    }

    // mine the block POW taking in difficulty and newblock data
    mineBlock(difficulty, newBlock) {
        console.log("we made it to the miner function");
        this.dateCreated = createDate();
        while (this.blockHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.blockHash = this.calculateBlockHash();
        }
        console.log("we made it through the while loop");
        const newBlockHash = this.calculateBlockHash(newBlock);

        console.log("Block mined, nonce: " + this.nonce + ", hash: " + newBlockHash);
    }
}

// calculate the blockhash (block data hash + dateCreated + nonce) for outside the block class 
export function calculateBlockHash(blockDataHash, dateCreated, nonce) {
    return CryptoJS.SHA256(blockDataHash + dateCreated + nonce).toString();
}

// mine the block POW taking in difficulty and newblock data *** this is the function used in the mining proccess when then mine button is submitted 
export function mineNewBlock(difficulty, newBlock) {
    while (newBlock.blockHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        newBlock.nonce++;
        newBlock.blockHash = calculateBlockHash(newBlock.blockDataHash, newBlock.dateCreated, newBlock.nonce);
    }
    const newBlockHash = calculateBlockHash(newBlock.blockDataHash, newBlock.dateCreated, newBlock.nonce);

    console.log("Block mined, nonce: " + newBlock.nonce + ", hash: " + newBlockHash);
    return newBlock;
}

// create an accurate date in ISO format
export function createDate() {
    let date1 = new Date();
    let date = date1.toISOString();
    return date
}


