
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

// create the block class which each new block will follow
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

    // calculate the block DATA hash using SHA256
    calculateBlockDataHash() {
        return CryptoJS.SHA256(this.index + JSON.stringify(this.transactions) + this.difficulty + this.previousBlockHash + this.minedBy).toString();
    }

    // calculate the block hash using SHA256 which takes the blockDataHash and nonce
    calculateBlockHash() {
        return CryptoJS.SHA256(this.blockDataHash + this.nonce).toString();
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
        for (const txn of this.transactions) {
            txn.minedInBlockIndex = newBlock.index;
            txn.transferSuccessful = true;
        }
        while (this.blockHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.blockHash = this.calculateBlockHash();
        }
        const newBlockHash = this.calculateBlockHash(newBlock);

        console.log("Block mined, nonce: " + this.nonce + ", hash: " + this.blockHash);
    }
}

// calculate the blockhash (block data hash + nonce) for outside the block class 
export function calculateBlockHash(newBlock) {
    return CryptoJS.SHA256(newBlock.blockDataHash + newBlock.nonce).toString();
}

// create an accurate date in ISO format
export function createDate() {
    let date1 = new Date();
    let date = date1.toISOString();
    return date
}


