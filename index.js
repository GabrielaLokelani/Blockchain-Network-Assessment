
import BlockChain from "./src/chain";
import Transaction from "./src/transaction";
import { createWallet, validateWallet } from "./src/wallet";

// initialize the new blockcahin
const MIEWCOIN_BLOCKCHAIN = new BlockChain()

// init wallets
const myWallet = createWallet();
const jakeWallet = createWallet();
console.log("is myWallet privateKey equal to publicKey?", validateWallet(myWallet.privateKey, myWallet.publicKey));

// init transaction and send 50 coins to jakes wallet
const txn1 = new Transaction(myWallet.publicKey, jakeWallet.publicKey, 50, this.miningReward, Date.now(), 'first transaction data!');

// sign 
txn1.signTransaction(myWallet.keyPair);

// submit txn
MIEWCOIN_BLOCKCHAIN.addTransaction(txn1);
console.log('Starting up miner for block 1... ');
MIEWCOIN_BLOCKCHAIN.minePendingTransactions(myWallet.publicKey);

// add more txns and blocks so smale chain will be 3 blocks in height
const txn2 = new Transaction(myWallet.publicKey, jakeWallet.publicKey, 75, this.miningReward, Date.now(), 'second transaction data!');
txn2.signTransaction(myWallet.keyPair);
MIEWCOIN_BLOCKCHAIN.addTransaction(txn2);
console.log('Starting up miner for block 2... ');
MIEWCOIN_BLOCKCHAIN.minePendingTransactions(myWallet.publicKey);

const txn3 = new Transaction(myWallet.publicKey, jakeWallet.publicKey, 100, this.miningReward, Date.now(), 'third transaction data!');
txn3.signTransaction(myWallet.keyPair);
MIEWCOIN_BLOCKCHAIN.addTransaction(txn3);
console.log('Starting up miner for block 3... ');
MIEWCOIN_BLOCKCHAIN.minePendingTransactions(myWallet.publicKey);

// If the transfer is successful, the balance of Jake's account will be 50, 75, 100 added.
console.log("Balance of Jake's account is: ", MIEWCOIN_BLOCKCHAIN.getBalanceOfAddress(jakeWallet.publicKey));

// Test blockchain validation
console.log("is the chain valid? " + MIEWCOIN_BLOCKCHAIN.isChainValid());

// We manually altered data in the blockchain
MIEWCOIN_BLOCKCHAIN.chain[1].transactions[0].value = 200;

console.log("is the chain still valid? " + MIEWCOIN_BLOCKCHAIN.isChainValid());

// We print the whole blockchain
console.log(JSON.stringify(MIEWCOIN_BLOCKCHAIN, null, 4));
