
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

export default class Block {
    constructor(index, transactions, minedBy, dateCreated, previousBlockHash) {
        this.index = index;
        this.transactions = transactions;
        this.minedBy = minedBy.toString();
        this.dateCreated = dateCreated;
        this.previousBlockHash = previousBlockHash.toString();
        this.nonce = 0;
        this.blockDataHash = this.calculateBlockDataHash();
        this.blockHash = this.calculateBlockHash();
    }

    calculateBlockDataHash() {
        return CryptoJS.SHA256(this.index + JSON.stringify(this.transactions) + this.minedBy + this.dateCreated + this.previousBlockHash + this.nonce).toString();
    }

    calculateBlockHash() {
        return CryptoJS.SHA256(this.blockDataHash + this.nonce).toString();
    }

    checkTransactionsValidity() {
        for (const txn of this.transactions) {

        }
        return true;
    }

    mineBlock(difficulty) {
        while (this.blockHash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.blockHash = this.calculateBlockHash();
        }

        console.log("Block mined, nonce: " + this.nonce + ", hash: " + this.blockHash);
    }
}



// ● Index – The index of the block
// ● Transactions – The transactions that are included in the block 
    // o From – Address of the sender 
    // o To – Address of the receiver 
    // o Value – the amount of money 
    // o Fee – the fee for the transaction
    // o dateCreated – the timestamp of the transaction
    // o data – Some additional data, if you want to add some message to the transaction
    // o senderPubKey – The public key of the sender 
    // o senderSignature – The signature of the sender
    // o minedInBlockIndex – the block index in which the transaction is mined
    // o transferSuccessful – true if the transaction is mined, false if it has not mined
// ● Difficulty – the difficulty of the block
// ● minedBy – the miner’s address
// ● nonce – The proof for the block, (nonce + blockHash) need to hash to a value below the difficulty value
// ● dateCreated – The timestamp of the block
// ● prevBlockHash – The previous block hash
// ● blockDataHash – The hash of the data in the block
// ● blockHash – the hash of the blockDataHash plus the nonce