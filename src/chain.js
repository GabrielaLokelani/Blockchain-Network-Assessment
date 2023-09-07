// IMPORT RELEVANT LIBRARIES, VARIABLES AND FUNCTIONS
import Block from './block';
import { calculateBlockHash, createDate, mineNewBlock } from './block';
import { MIEWCOIN_BLOCKCHAIN } from '../index'
import Transaction from './transaction';
import { broadcast, responseLatestMsg} from "./node";
import { faucetAddress } from "./faucetWallet";
const CryptoJS = require('crypto-js');
const math = require('mathjs');

// create mining job mempool
export let miningJobs = new Map();
export let confirmedAddressBalance = new Map();
const miningReward = 5000000;
// let bigIntReward = BigInt(miningReward);
// console.log("This is the mining reward to number again: ", Number(bigIntReward));

// create the blockchain class that will hold the chain
export default class BlockChain {
    constructor() {
        this.chain = [this.creationOfGenesisBlock()];
        this.pendingTransactions = [];
    }

    // create the genesis block to start the chain
    creationOfGenesisBlock() {
        let genesisBlock = new Block(0, [{
            "from": "0000000000000000000000000000000000000000",
            "to": faucetAddress,
            "value": 1000000000000, "fee": 0,
            "dateCreated": "2023-08-22T05:30:49.694Z",
            "data": "genesis tx",
            "senderPubKey": "000000000000000000000000000000000000000000000000000000000000000000",
            "transactionDataHash": "2466ce78ebefb1e1f69948ade3d85d9b1beab79d724f9624ebde6b74a1cd8508",
            "signature": {"r": "000000000000000000000000000000000000000000000000000000000000000000", "s": "000000000000000000000000000000000000000000000000000000000000000000"},
            "minedInBlockIndex": 0, "transferSuccessful": true
            }], 0, "0000000000000000000000000000000000000000", '', "2023-08-22T05:30:49.694Z");
            genesisBlock.nonce = 0;   
            genesisBlock.dateCreated = "2023-08-22T05:30:49.694Z";
            genesisBlock.blockHash = genesisBlock.calculateBlockHash();

        return genesisBlock
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

        let block = new Block(newIndex, this.pendingTransactions, 2, miningRewardAddress, latestBlock.blockHash);

        let totalFees = 0;
        for (const txn of block.transactions) {
            totalFees =  math.add(totalFees, txn.fee);
            console.log("total fees: " + totalFees);
        }
        let totalReward = math.add(totalFees, miningReward);
        const minerTXN = new Transaction("0000000000000000000000000000000000000000", miningRewardAddress, totalReward, 0, createDate(), "coinbase tx", "00000000000000000000000000000000000000000000000000");
        minerTXN.signRewardTransaction({"r": "000000000000000000000000000000000000000000000000000000000000000000", "s": "000000000000000000000000000000000000000000000000000000000000000000"});
        this.pendingTransactions.unshift(minerTXN);

        block.mineBlock(2, block);
        console.log('Block was successfully mined!');

        MIEWCOIN_BLOCKCHAIN.addBlock(block);

        // empty out the pending transactions array
        this.pendingTransactions = [];

        return block;
    }

    // function to get the mining job, miner submits their address, a block candidate is created to be given to the miner
    getMiningJob(miningRewardAddress) {
        const latestBlock = this.getBlock(this.getHeight());
        let newIndex = latestBlock.index + 1;

        let block = new Block(newIndex, this.pendingTransactions, 5, miningRewardAddress, latestBlock.blockHash);

        let totalFees = 0;
        for (const txn of block.transactions) {
            totalFees =  math.add(totalFees, txn.fee);
            txn.minedInBlockIndex = block.index;
            txn.transferSuccessful = true;
        }
        let totalReward = math.add(totalFees, miningReward);
        const minerTXN = new Transaction("0000000000000000000000000000000000000000", miningRewardAddress, totalReward, 0, createDate(), "coinbase tx", "00000000000000000000000000000000000000000000000000");
        minerTXN.signRewardTransaction({"r": "000000000000000000000000000000000000000000000000000000000000000000", "s": "000000000000000000000000000000000000000000000000000000000000000000"});
        minerTXN.minedInBlockIndex = block.index;
        minerTXN.transferSuccessful = true;

        // check to see if there is a coinbase tx for the miner already
        if (block.transactions[0].data != "coinbase tx" ) {
            this.pendingTransactions.unshift(minerTXN);
        // if there is a coinbase tx already, replace it with the new coinbase miner txn
        } else {
            this.pendingTransactions.splice(0, 1, minerTXN);
        }

        let blockString = JSON.stringify(block)
        miningJobs.set(`${block.blockDataHash}`, `${blockString}`);

        return block;
    }

    mineBlockCandidate(blockDataHash) {
        if (blockDataHash != undefined) {
            let block = miningJobs.get(`${blockDataHash}`);
            block = JSON.parse(block);
            block.nonce = 0;
            block.dateCreated = createDate();
            block.blockHash = '';
            let minedBlock = mineNewBlock(5, block);
            return minedBlock;
        } else {
            throw new Error("Sorry, the difficulty must be at least 5 and there must be a blockDataHash")
        }
    }

    // submit a new mined block 
    submitMinedBlock(blockHash, dateCreated, nonce, blockDataHash) {
        let candidate = miningJobs.get(`${blockDataHash}`);
        candidate = JSON.parse(candidate);

        let rewardAmount = candidate.transactions[0].value;

        const latestBlock = this.getBlock(this.getHeight());
        console.log("Is the blockDataHash matching? ", blockDataHash === candidate.blockDataHash);
        if (candidate.index === latestBlock.index + 1) {
            let candidateBlockHash = calculateBlockHash(candidate.blockDataHash, dateCreated, nonce);
            if (candidateBlockHash === blockHash) {
                candidate.nonce = nonce;
                candidate.dateCreated = dateCreated;
                candidate.blockHash = blockHash
                MIEWCOIN_BLOCKCHAIN.addBlock(candidate);
                miningJobs.clear();
                this.pendingTransactions = [];
                return candidate, rewardAmount;
            }
        } else {
            throw new Error("Sorry, a new block for that index has already been accepted");
        }
        return candidate, rewardAmount;
    }

    // add a transaction to the pending transaction pool after validation
    addTransaction(transaction) {
        if (transaction.from != null || transaction.to != null || transaction.senderPubKey != null) {
            this.pendingTransactions.push(transaction);
        }
    }

    // get pending balance of an address
    getPendingBalanceOfAddress(address) {
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
        for (const transaction of this.pendingTransactions) {
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
        return balance;
    }

    // get safe balance of an address
    getSafeBalanceOfAddress(address) {
        let balance = 0;
        if (this.chain.length >= 2) {
            for (const block of this.chain) {
                if (block.index <= this.chain.length - 2) {
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
            }
        }
        return balance;
    }

    // get confirmed Balance of an address
    getConfirmedBalanceOfAddress(address) {
        let balance = 0;
        if (this.chain.length >= 7) {
            for (const block of this.chain) {
                if (block.index <= this.chain.length - 7) {
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

                        confirmedAddressBalance.set(`${address}`, `${balance}`);
                    }
                    confirmedAddressBalance.set(`${address}`, `${balance}`);
                }
            }
        }
        return balance;
    }

    allBalances() {
        if (this.chain.length >= 7) {
            let confirmedTxnArray = this.getConfirmedTransactions();
            confirmedTxnArray.forEach((value, index) => {
                this.getConfirmedBalanceOfAddress(value.to);
                this.getConfirmedBalanceOfAddress(value.from);
            })
        } else {
            return "Sorry, the chain is not long enough to get any confirmed balances! Come back later :)"
        }
        return [...confirmedAddressBalance.entries()];
    }

    // get all confirmed transactions
    getConfirmedTransactions() {
        let confirmedTxns = [];
        if (this.chain.length >= 7) {
            for (const block of this.chain) {
                if (block.index <= this.chain.length - 7) {
                    for (const transaction of block.transactions) {
                        confirmedTxns.push(transaction);
                    }
                }
            }
        } else {
            return "Sorry the chain must contain at least 7 blocks"
        }
        return confirmedTxns;
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

    getCurrentCumulativeDifficulty() {
        // subtracting one becuase the genesis block will be 0
        let chainLength = this.chain.length - 1;
        // have it set to 5 because that is the fixed block difficulty
        let currentCumulativeDifficulty = math.multiply(chainLength, 5);
        return currentCumulativeDifficulty
    }

    isCurrentCumDiffLT(blockchainToValidate) {
        let otherChainLength = blockchainToValidate.length - 1;
        let otherCurrentCumulativeDifficulty = math.multiply(otherChainLength, 5);
        let currentCumulativeDifficulty = this.getCurrentCumulativeDifficulty();
        if (currentCumulativeDifficulty > otherCurrentCumulativeDifficulty) {
            return false;
        } else if (currentCumulativeDifficulty == otherCurrentCumulativeDifficulty) {
            return false;
        }
        return true;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // testing purposes 
            console.log('current blockhash' + currentBlock.blockHash);
            console.log('calculated blockhash' + currentBlock.calculateBlockHash(currentBlock.blockDataHash, currentBlock.dateCreated, currentBlock.nonce));
            // Check if all transactions in the block are valid.
            if (!currentBlock.checkTransactionsValidity()) {
                return false;
            }
            if (currentBlock.blockHash !== currentBlock.calculateBlockHash(currentBlock.blockDataHash, currentBlock.dateCreated, currentBlock.nonce)) {
                console.error("hash not equal: " + JSON.stringify(currentBlock));
                return false;
            }
            if (currentBlock.previousBlockHash !== previousBlock.calculateBlockHash(previousBlock.blockDataHash, previousBlock.dateCreated, previousBlock.nonce)) {
                console.error("previous hash is not right: " + JSON.stringify(currentBlock));
                return false;
            }
        }
        return true;
    }

    // check if the new block is valid by comparing newBlock to prevBlock via index and block hashes then by recalculating the block hash
    isValidNewBlock(newBlock, previousBlock) {
        let blockDifficulty = newBlock.difficulty;
        let blockHashDifficulty = newBlock.blockHash.slice(0, blockDifficulty);

        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.blockHash !== newBlock.previousBlockHash) {
            console.log('invalid previous Hash');
            return false;
        } else if (calculateBlockHash(newBlock.blockDataHash, newBlock.dateCreated, newBlock.nonce) !== newBlock.blockHash) {
            console.log('invalid block hash');
            return false;
        } else if (blockHashDifficulty.length < 5) {
            console.log('block hash does not represent a difficulty of 5 or greater');
            return false
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
        // validate that genesis blocks match
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.creationOfGenesisBlock())) {
            return false;
        }
        // validate that the current cumulative difficulty is less than the recieved blockchains cumulative difficulty
        if (this.isCurrentCumDiffLT(blockchainToValidate) == false) {
            return false;
        }
        // break the recieved chain into its blocks to validate the individual blocks
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
            miningJobs.clear();
            broadcast(responseLatestMsg());
        } else {
            console.log('recieved blockchain is invalid');
        }            
    }

}

// confirmed transactions original
// let listOfTXN = '';
// for (const block of this.chain) {
//     if (block.transactions != null) {
//         listOfTXN = JSON.stringify(block.transactions);
//     }
// }
// return listOfTXN;

// original allBalances
            // confirmedAddressBalance.forEach((values, key, map) => {
            //     console.log("this is the values and keys for the balance" , values, key, map)
            //     let address = key;
            //     let balance = confirmedAddressBalance.get(`${address}`);
            //     console.log("here is the allBalances: ", address, balance);
            //     return address, balance
            // });