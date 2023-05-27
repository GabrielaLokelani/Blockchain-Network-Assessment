import Block from './block';
import Transaction from './transaction';
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');

export default class BlockChain {
    constructor() {
        this.chain = [this.creationOfGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    creationOfGenesisBlock() {
        return new Block(0, [], "0000000000000000000000000000000000000000", Date.now(), '')
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

    minePendingTransactions(miningRewardAddress) {
        const latestBlock = this.getBlock(this.getHeight());
        let newIndex = latestBlock.index + 1;

        let block = new Block(newIndex, this.pendingTransactions, miningRewardAddress, Date.now(), latestBlock.blockHash);

        block.mineBlock(this.difficulty);
        console.log('Block was successfully mined!');

        this.addBlock(block);
        // this.chain.push(block)

        // Put the miner fee transaction into pendingTransactions for the next processing operation. The miner fee transaction is characterized by the source account being empty.
        this.pendingTransactions = [
            // new Transaction(null, miningRewardAddress, this.miningReward, 0, '')
            // new Transaction(null, miningRewardAddress, 5, this.miningReward, Date.now(), "transaction data")
        ];

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

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.from === address) {
                    balance -= transaction.value;
                }

                if (transaction.to === address) {
                    balance += transaction.value;
                }
            }
        }
        return balance;
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
        } else if (newBlock.calculateBlockHash() !== newBlock.blockHash) {
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
    isValidChain() {
        let blockchainToValidate = [this.chain];
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.creationOfGenesisBlock())) {
            console.log('did this fire')
            return false;
        }
        console.log('did this fire %%%')
        var tempBlocks = [blockchainToValidate];
        for (let i = 1; i < blockchainToValidate.length; i++) {
            if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
                tempBlocks.push(blockchainToValidate[i]);
            } else {
                return false;
            }
        }
        console.log('did this fire $$')
        return true;
    }

    replaceChain(newBlocks) {
        if (isValidChain(newBlocks) && newBlocks.length > this.chain.length) {
            console.log('recieved blockchain is valid. Replacing current blockchain with recieved blockchain');
            this.chain = newBlocks;
            // broadcast(responseLatestMsg());
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