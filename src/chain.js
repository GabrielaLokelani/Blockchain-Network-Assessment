// IMPORT RELEVANT LIBRARIES, VARIABLES AND FUNCTIONS
import Block from './block';
import { calculateBlockHash, createDate } from './block';
import { MIEWCOIN_BLOCKCHAIN } from '../index'
import Transaction from './transaction';
import { broadcast, responseLatestMsg } from "./node";
import { faucetAddress } from "./faucetWallet";
const CryptoJS = require('crypto-js');
const math = require('mathjs')

export default class BlockChain {
    constructor() {
        this.chain = [this.creationOfGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 5000000;
    }

    // create the genesis block to start the chain
    creationOfGenesisBlock() {
        return new Block(0, [{
            "from": "0000000000000000000000000000000000000000",
            "to": faucetAddress,
            "value": 1000000000000, "fee": 0,
            "dateCreated": "2023-08-22T05:30:49.694Z",
            "data": "genesis tx",
            "senderPubKey": "000000000000000000000000000000000000000000000000000000000000000000",
            "transactionDataHash": "2466ce78ebefb1e1f69948ade3d85d9b1beab79d724f9624ebde6b74a1cd8508",
            "signature": {"r": "000000000000000000000000000000000000000000000000000000000000000000", "s": "000000000000000000000000000000000000000000000000000000000000000000"},
            "minedInBlockIndex": 0, "transferSuccessful": true
            }], "0000000000000000000000000000000000000000", "2023-08-22T05:30:49.694Z", '')
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

        let block = new Block(newIndex, this.pendingTransactions, miningRewardAddress, createDate(), latestBlock.blockHash);

        block.mineBlock(2, block);
        console.log('Block was successfully mined!');

        MIEWCOIN_BLOCKCHAIN.addBlock(block);

        // Put the miner fee transaction into pendingTransactions for the next processing operation??? The miner fee transaction is characterized by the source account being empty.
        this.pendingTransactions = [];

        // ?? should the minertxn be the fee from the txns being mined AND the reward and *** main issue rn is how to do all those txns and signing with privkeys
        let totalFees = 0;
        for (const txn of block.transactions) {
            math.add(totalFees, txn.fee);
        }
        const totalReward = totalFees + 5000000;
        const minerTXN = new Transaction("0000000000000000000000000000000000000000", miningRewardAddress, totalReward, 0, createDate(), "coinbase tx", "00000000000000000000000000000000000000000000000000");
        minerTXN.signRewardTransaction(["000000000000000000000000000000000000000000000000000000000000000000","000000000000000000000000000000000000000000000000000000000000000000"]);
        this.pendingTransactions.push(minerTXN);

        return block;
    }

    // function to get the mining job, miner submits their address, a block candidate is created to be given to the miner
    getMiningJob(miningRewardAddress) {
        const latestBlock = this.getBlock(this.getHeight());
        let newIndex = latestBlock.index + 1;

        let block = new Block(newIndex, this.pendingTransactions, miningRewardAddress, createDate(), latestBlock.blockHash);

        let totalFees = 0;
        for (const txn of block.transactions) {
            totalFees =  math.add(totalFees, txn.fee);
            console.log("total fees: " + totalFees);
        }
        let totalReward = math.add(totalFees, this.miningReward);
        const minerTXN = new Transaction("0000000000000000000000000000000000000000", miningRewardAddress, totalReward, 0, createDate(), "coinbase tx", "00000000000000000000000000000000000000000000000000");
        minerTXN.signRewardTransaction({"r": "000000000000000000000000000000000000000000000000000000000000000000", "s": "000000000000000000000000000000000000000000000000000000000000000000"});
        this.pendingTransactions.unshift(minerTXN);

        block.mineBlock(2, block);
        console.log('Block was successfully mined!');

        return block;
    }

    // submit a new mined block 
    submitMinedBlock(newBlock) {
        let candidate = JSON.parse(newBlock);
        let rewardAmount = candidate.transactions[0].value;
        console.log("here is the new block index for candidate: " + candidate.index);
        const latestBlock = this.getBlock(this.getHeight());
        if (candidate.index === latestBlock.index + 1) {
            let candidateBlockHash = calculateBlockHash(candidate);
            console.log("candidate block hash re-calculated: " + candidateBlockHash);
            console.log("candidate block hash: " + candidate.blockHash);
            if (candidateBlockHash === candidate.blockHash) {
                MIEWCOIN_BLOCKCHAIN.addBlock(candidate);
                this.pendingTransactions = [];
                return candidate, rewardAmount
            }
        } else {
            throw new Error("Sorry, a new block for that index has already been accepted");
        }
        return candidate, rewardAmount
    }

    // add a transaction to the pending trabsaction pool after validation
    addTransaction(transaction) {
        // if (!transaction.from || !transaction.to || !transaction.value || !transaction.fee || !transaction.data || !transaction.senderPubkey) {
        //     throw new Error('Sorry! Transaction is missing a value.');
        // }
        // ***!!! TURNED OFF FOR NOW WHILE SIGNING WAS CHANGED ***!!!
        // if (!transaction.isValid()) {
        //     throw new Error('Cannot add invalid transaction to the chain');
        // }

        // push to mempool
        this.pendingTransactions.push(transaction)
    }

    // get balance of an address
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.from === address) {
                    balance = math.subtract(balance, transaction.value);
                    balance = math.subtract(balance, transaction.fee);
                }

                if (transaction.to === address) {
                    balance = math.add(balance, transaction.value);
                }

                if (transaction.from === "0000000000000000000000000000000000000000") {
                    balance = math.add(balance, transaction.fee);
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
                    return listOfTXN;
                } else {
                    for (const transaction of this.pendingTransactions) {
                        if (transaction.from === address) {
                            listOfTXN = JSON.stringify(transaction);
                            return ("PENDING TRNASACTION(S): " + "\n" + listOfTXN);
                        }
                    }
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
                    return txn;
                } else {
                    for (const transaction of this.pendingTransactions) {
                        if (transaction.transactionHash === txnHash) {
                            txn = JSON.stringify(transaction);
                            return ("PENDING TRNASACTION: " + "\n" + txn);
                        }
                    }
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

    // check if the new block is valid by comparing newBlock to prevBlock via index and block hashes then by recalculating the block hash
    isValidNewBlock(newBlock, previousBlock) {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.blockHash !== newBlock.previousBlockHash) {
            console.log('invalid previous Hash');
            return false;
        } else if (calculateBlockHash(newBlock) !== newBlock.blockHash) {
            return false;
        }
        return true;
    }

    // adds the new block to the chain after running through isValidNewBlock() function
    addBlock(newBlock) {
        const latestBlock = this.getBlock(this.getHeight());
        console.log('is new block valid? ' + this.isValidNewBlock(newBlock, latestBlock))
        if (this.isValidNewBlock(newBlock, latestBlock)) {
            this.chain.push(newBlock);
        }
    }

    // checks to see if the recieved chain is valid
    isValidChain(blockchainToValidate) {
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

    // will replace the chain if the recieved chain is longer (has more work) and is valid by running through replaceChain() function
    replaceChain(newBlocks) {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.chain.length) {
            console.log('recieved blockchain is valid. Replacing current blockchain with recieved blockchain');
            this.chain = newBlocks;
            broadcast(responseLatestMsg());
        } else {
            console.log('recieved blockchain is invalid');
        }            
    }

}
