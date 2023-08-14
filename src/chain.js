import Block from './block';
import { calculateBlockHash } from './block';
import { MIEWCOIN_BLOCKCHAIN } from '../index'
import Transaction from './transaction';
import { broadcast, responseLatestMsg } from "./node";
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

export default class BlockChain {
    constructor() {
        this.chain = [this.creationOfGenesisBlock()];
        // this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 5000000;
    }

    creationOfGenesisBlock() {
        return new Block(0, [], "0000000000000000000000000000000000000000", '8/13/2023', '')
    }

    // The method to get the current height of the chain (the latest added block in the chain length).
    getHeight() {
      return this.chain.length - 1;
    }

    //  Method to get a specific block of the chain, set by height (the specific index in the chain).
    getBlock(height) {
        return this.chain[height];
    }

    fetchLatestBlock() {
        return this.chain[this.chain - 1];
    }

    returnChain() {
        return this.chain;
    }

    minePendingTransactions(miningRewardAddress) {
        const latestBlock = this.getBlock(this.getHeight());
        let newIndex = latestBlock.index + 1;

        let block = new Block(newIndex, this.pendingTransactions, miningRewardAddress, Date.now(), latestBlock.blockHash);

        block.mineBlock(2, block);
        console.log('Block was successfully mined!');

        MIEWCOIN_BLOCKCHAIN.addBlock(block);

        // Put the miner fee transaction into pendingTransactions for the next processing operation??? The miner fee transaction is characterized by the source account being empty.
        this.pendingTransactions = [];

        // ?? should the minertxn be the fee from the txns being mined AND the reward and *** main issue rn is how to do all those txns and signing with privkeys
        // for (const txn of block.transactions) {
        //     // issue with getting paid with the mining fee and mining reward bc it takes extra coins from sender who should only pay fee, "00000..." should pay that reward with coinbase txn
        //     const minerTXN = new Transaction(txn.from, miningRewardAddress, txn.fee, 0, Date.now(), "mining reward!", txn.senderPubKey);
        //     console.log("here is the new supposed txn for the miners reward:    " + JSON.stringify(minerTXN));
        //     minerTXN.signTransaction(txn.senderPrivKey);
        //     console.log("here is the minerTXN senders privkey:   " + txn.senderPrivKey);
        //     MIEWCOIN_BLOCKCHAIN.addTransaction(minerTXN);
        // }

        let totalFees = 0;
        for (const txn of block.transactions) {
            totalFees += txn.fee;
        }
        console.log("total fees in this block:   " + totalFees);
        let totalReward = totalFees + this.miningReward;
        const minerTXN = new Transaction("0000000000000000000000000000000000000000", miningRewardAddress, totalReward, 0, Date.now(), "mining reward!", "00000000000000000000000000000000000000000000000000");
        minerTXN.signRewardTransaction("00000000000000000000000000000000000000000000000000");
        this.pendingTransactions.push(minerTXN);


        return block;
    }

    addTransaction(transaction) {
        if (!transaction.from || !transaction.to) {
            throw new Error('Sorry! Transaction must include a from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to the chain');
        }

        // push to mempool
        this.pendingTransactions.push(transaction)
    }

    // get balance of an address
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.from === address) {
                    balance -= transaction.value;
                    balance -= transaction.fee;
                }

                if (transaction.to === address) {
                    balance += transaction.value;
                }
            }
        }
        return balance;
    }

    // get all confirmed transactions
    getConfirmedTransactions() {
        let listOfTXN = "";
        for (const block of this.chain) {
            if (block.transactions != null) {
                listOfTXN = JSON.stringify(block.transactions);
                // return block.transactions;
            }
        }
        return listOfTXN;
    }

    // get all transactions for a specific address 
    getTransactionsForAddress(address) {
        let listOfTXN = "";
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.from === address) {
                    listOfTXN = JSON.stringify(transaction);
                }
            }
        }
        return listOfTXN;
    }

    // get specific transaction by its hash
    getTransactionByHash(txnHash) {
        let txn = "";
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.transactionHash === txnHash) {
                    txn = JSON.stringify(transaction);
                }
            }
        }
        return txn;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // testing purposes 
            console.log('current blockhash' + currentBlock.blockHash);
            console.log('calculated blockhash' + currentBlock.calculateBlockHash());
            // Check if all transactions in the block are valid.
            if (!currentBlock.checkTransactionsValidity()) {
                return false;
            }
            if (currentBlock.blockHash !== currentBlock.calculateBlockHash()) {
                console.error("hash not equal: " + JSON.stringify(currentBlock));
                return false;
            }
            if (currentBlock.previousBlockHash !== previousBlock.calculateBlockHash()) {
                console.error("previous hash is not right: " + JSON.stringify(currentBlock));
                return false;
            }
        }
        return true;
    }

    isValidNewBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.blockHash !== newBlock.previousBlockHash) {
            console.log('invalid previous Hash');
            return false;
        } else if (calculateBlockHash(newBlock) !== newBlock.blockHash) {
            // console.log(typeof (newBlock.blockHash) + ' ' + typeof calculateBlockHash(newBlock));
            // console.log('invalid hash: ' + calculateBlockHash(newBlock) + ' ' + newBlock.blockHash);
            return false;
        }
        return true;
    }

    addBlock(newBlock) {
        const latestBlock = this.getBlock(this.getHeight());
        console.log('is new block valid? ' + this.isValidNewBlock(newBlock, latestBlock))
        if (this.isValidNewBlock(newBlock, latestBlock)) {
            this.chain.push(newBlock);
        }
    }

    // still need to get this function working
    isValidChain(blockchainToValidate) {
        console.log("See what JSON.stringify(blockchainToValidate[0]) is:   " + JSON.stringify(blockchainToValidate));
        console.log("See what the genesis block in the test is:   " + JSON.stringify(this.creationOfGenesisBlock()));
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.creationOfGenesisBlock())) {
            return false;
        }
        var tempBlocks = [blockchainToValidate[0]];
        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
                tempBlocks.push(blockchainToValidate[i]);
            } else {
                return false;
            }
        }
        return true;
    }

    replaceChain(newBlocks) {
        console.log("We have hit the replaceChain function");
        console.log("here are the new blocks to replace the chain:   " + JSON.stringify(newBlocks));
        if (this.isValidChain(newBlocks) && newBlocks.length > this.chain.length) {
            console.log('recieved blockchain is valid. Replacing current blockchain with recieved blockchain');
            MIEWCOIN_BLOCKCHAIN = newBlocks;
            broadcast(responseLatestMsg());
        } else {
            console.log('recieved blockchain is invalid');
        }            
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
// ● Difficulty – the difficulty of the block ** putting in chain file **
// ● minedBy – the miner’s address
// ● nonce – The proof for the block, (nonce + blockHash) need to hash to a value below the difficulty value
// ● dateCreated – The timestamp of the block
// ● prevBlockHash – The previous block hash
// ● blockDataHash – The hash of the data in the block
// ● blockHash – the hash of the blockDataHash plus the nonce


// isValidChain(blockchainToValidate) {
//     console.log
//     if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.creationOfGenesisBlock())) {
//         return false;
//     }
//     var tempBlocks = [blockchainToValidate];
//     for (let i = 1; i < blockchainToValidate.length; i++) {
//         if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
//             tempBlocks.push(blockchainToValidate[i]);
//         } else {
//             return false;
//         }
//     }
//     return true;
// }