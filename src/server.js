'use strict';

// IMPORT RELEVANT LIBRARIES
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

import BlockChain from "./chain";
import Transaction from "./transaction";
import { createDate } from './block';
import { createWallet, openWallet } from "./wallet";
import { sockets, broadcast, responseLatestMsg, connectToPeers} from "./node"
import { MIEWCOIN_BLOCKCHAIN } from '../index';
import { faucetTransaction } from './faucet';


export const http_port = process.env.HTTP_PORT || 5555;

// rest api logic for blocks, createWallet, pendingTransactions, minePendingTransactions, peers, sendTransactions, ect...
export function initHttpServer() {
    let app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);
    app.use(express.static('public'));

    //  Homepage
    app.get('/home', (req, res) => {
        res.render('../views/home.html');
    });

    // get block explorer page
    app.get('/blockExplorer', (req, res) => {
        res.render('../views/blockExplorer.html');
    });

    // get wallet explorer page
    app.get('/wallet', (req, res) => {
        res.render('../views/wallet.html');
    });

    app.get('/openWallet', (req, res) => {
        res.render('../views/openWallet.html');
    });

    app.post('/openWallet', (req, res) => {
        if (req.body.privKey) {
            let openedWallet = openWallet(req.body.privKey);
            res.send({ 'address:': openedWallet.address, "publicKey": openedWallet.pubKey, "publicKeyCompressed": openedWallet.publicKeyCompressed, "privKey": openedWallet.privateKey});
        } else {
            throw new Error("Sorry we could not find a wallet for that private key, check to make sure it is entered correctly.")
        }
    });

    // // get faucet page
    // app.get('/faucet', (req, res) => {
    //     res.render('../views/faucet.html');
    // });

    // app.post('/faucet', (req, res) => {
    //     faucetTransaction(req.body.toAddress, req.body.requestAmount);
    // });

    // get all blocks in the blockchain
    app.get('/blocks', (req, res) => res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN)));

    // get a specific block by its index 
    app.get('/blockIndex/:index', (req, res) => {
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.getBlock(req.params.index)));
    });

    // create a new wallet and return the address, private and public keys
    app.get('/createWallet', (req, res) => {
        let newWallet = createWallet();
        res.send({ 'address:': newWallet.address, "publicKey": newWallet.pubKey, "publicKeyCompressed": newWallet.publicKeyCompressed, "privKey": newWallet.privateKey});
    });

    // get all pending transactions
    app.get('/transactions/pending', (req, res) => {
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.pendingTransactions));
    });

    // get all confirmed transactions 
    app.get('/transactions/confirmed', (req, res) => {
        const confirmedTXNs = MIEWCOIN_BLOCKCHAIN.getConfirmedTransactions();
        res.send(confirmedTXNs);
    });

    // get specific transaction by its hash 
    app.get('/transactionHash/:txnHash', (req, res) => {
        const transaction = MIEWCOIN_BLOCKCHAIN.getTransactionByHash(req.params.txnHash);
        res.send(transaction);
    });

    // get the send transaction page
    app.get('/transaction/send', (req, res) => {
        res.render('../views/sendTransaction.html');
    });

    // send a new transaction
    app.post('/transaction/send', (req, res) => {
        // create a new transaction
        if (req.body.fee >= 10 && req.body.from != null && req.body.to != null) {
            const newTXN = new Transaction(req.body.from, req.body.to, req.body.value, req.body.fee, createDate(), req.body.data, req.body.senderPubKey);
            // sign 
            newTXN.signTransaction(req.body.senderPrivKey, req.body.scrtMsg);

            // submit txn
            MIEWCOIN_BLOCKCHAIN.addTransaction(newTXN);
            console.log("Here is your new Transaction Hash: " + newTXN.transactionHash);
            res.redirect('/home');
        } else {
            res.send("Sorry, your transaction is missing either a to or from address or the fee is less than 10 micro coins");
        }
        res.send();
    });

    // get all??? balances ** need to do **
    app.get('/balances', (req, res) => {
        res.send();
    });

    // get all transactions for a specific address 
    app.get('/address/:address/transactions', (req, res) => {
        const transactions = MIEWCOIN_BLOCKCHAIN.getTransactionsForAddress(req.params.address);
        res.send(transactions);
    });

    // get the balance for a specific address 
    app.get('/address/:address/balance', (req, res) => {
        const balance = MIEWCOIN_BLOCKCHAIN.getBalanceOfAddress(req.params.address);
        res.send(balance.toString());
    });    

    // get miner main page
    app.get('/miner', (req, res) => {
        res.render('../views/miner.html');
    });

    // get minePendingTransactions / mineNextBlock html page and form to be able to mine the next block
    app.get('/minePendingTransactions', (req, res) => {
        res.render('../views/mineNextBlock.html');
    });

    // mine pending txns to mine the next block (all in one solution, no mining job and block candidate loading, use for testing purposes)
    app.post('/minePendingTransactions', (req, res) => {
        // submit miners address and init the miner
        MIEWCOIN_BLOCKCHAIN.minePendingTransactions(req.body.miningRewardAddress);
        broadcast(responseLatestMsg());
        res.send();
    });

    // get mining job page (just pulls up mineNextBlock html)
    app.get('/getMiningJob', (req, res) => {
        res.render('../views/mineNextBlock.html');
    });

    // get mining job, prepare the next block candidate for the miner
    app.post('/getMiningJob', (req, res) => {
        // submit miners address and get a mining job
        if (req.body.miningRewardAddress) {
            let blockCandidate = MIEWCOIN_BLOCKCHAIN.getMiningJob(req.body.miningRewardAddress);
            res.send(blockCandidate);
        }
    });

    // get submit mined block candidate page
    app.get('/submitMinedBlock', (req, res) => {
        res.render('../views/submitMinedBlock.html');
    });

    // post the new mined block for submission and approval to be added to the chain
    app.post('/submitMinedBlock', (req, res) => {
        MIEWCOIN_BLOCKCHAIN.submitMinedBlock(req.body.newBlock);
        broadcast(responseLatestMsg());
        res.send("Congratulations, You have successfully mined the next block in the chain!")
    });

    // reset the chain for debugging purposes
    app.post('/resetChain', (req, res) => {
        let MIEWCOIN_BLOCKCHAIN = new BlockChain();
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN));
    })

    // get array of connected peers
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    // add a peer to the network
    app.post('/peers/connect', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });

    // notify peers of new block ** need to do **
    app.post('/peers/notify-new-block', (req, res) => {
        broadcast(responseLatestMsg());
        res.send(broadcast(responseLatestMsg()));
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}

function drawView(res, view, data) {
    res.render('../views/' + view + '.html', data)
}