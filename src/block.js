
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

export default class Block {
    constructor(index, transactions, minedBy, dateCreated, previousBlockHash) {
        this.index = index;
        this.transactions = transactions;
        this.difficulty = 2;
        this.previousBlockHash = previousBlockHash.toString();
        this.minedBy = minedBy.toString();
        this.blockDataHash = this.calculateBlockDataHash();
        this.nonce = 0;
        this.dateCreated = dateCreated;
        this.blockHash = this.calculateBlockHash();
    }

    calculateBlockDataHash() {
        return CryptoJS.SHA256(this.index + JSON.stringify(this.transactions) + this.difficulty + this.previousBlockHash + this.minedBy).toString();
    }

    calculateBlockHash() {
        return CryptoJS.SHA256(this.blockDataHash + this.nonce).toString();
    }

    checkTransactionsValidity() {
        for (const txn of this.transactions) {

        }
        return true;
    }

    // mine the block POW taking in difficulty and newblock data
    mineBlock(difficulty, newBlock) {
        for (const txn of this.transactions) {
            txn.minedInBlockIndex = newBlock.index;
            txn.transferSuccessful = true;
        }
        while (this.blockHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.blockHash = this.calculateBlockHash();
        }
        const newBlockHash = this.calculateBlockHash(newBlock);
        console.log("supposed new blocks hash: " + newBlockHash);

        console.log("Block mined, nonce: " + this.nonce + ", hash: " + this.blockHash);
    }
}

// calculate the blockhash (block data hash + nonce) for outside the block class 
export function calculateBlockHash(newBlock) {
    return CryptoJS.SHA256(newBlock.blockDataHash + newBlock.nonce).toString();
}

export function createDate() {
    let date1 = new Date();
    let date = date1.toISOString();
    return date
}


