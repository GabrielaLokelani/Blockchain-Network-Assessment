'use strict';

// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const path = require('path')
const bodyParser = require('body-parser');

import BlockChain from "./chain";
import Transaction from "./transaction";
import { createDate } from './block';
import { createWallet } from "./wallet";
import { sockets, broadcast, responseLatestMsg, connectToPeers} from "./node"
import { MIEWCOIN_BLOCKCHAIN } from '../index';
import { faucetTransaction } from './faucet';


const http_port = process.env.HTTP_PORT || 5555;

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

    // // get faucet page
    // app.get('/faucet', (req, res) => {
    //     res.render('../views/faucet.html');
    // });

    // app.post('/faucet', (req, res) => {
    //     faucetTransaction(req.body.toAddress, req.body.requestAmount);
    // });

    // get all blocks in the blockchain
    app.get('/blocks', (req, res) => res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN)));

    // get a specific block by its index *** currently having to use req.body.idex need to figure out how to do through http :)
    app.get('/blocks/:index', (req, res) => {
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.getBlock(req.body.index)));
    });

    // create a new wallet and return the address, private and public keys
    app.get('/createWallet', (req, res) => {
        let newWallet = createWallet();
        res.send({ 'address:': newWallet.address, "publicKey": newWallet.pubKey, "publicKeyCompressed": newWallet.publicKeyCompressed, "privKey": newWallet.privateKey});
    });

    // get all pending transactions
    app.get('/transactions/pending', (req, res) => {
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.pendingTransactions));
    })

    // get all confirmed transactions 
    app.get('/transactions/confirmed', (req, res) => {
        const confirmedTXNs = MIEWCOIN_BLOCKCHAIN.getConfirmedTransactions();
        res.send(confirmedTXNs);
    });

    // get specific transaction by its hash 
    app.get('/transactions/:txnHash', (req, res) => {
        const transaction = MIEWCOIN_BLOCKCHAIN.getTransactionByHash(req.body.txnHash);
        res.send(transaction);
    });

    // get the send transaction page
    app.get('/transactions/send', (req, res) => {
        res.render('../views/sendTransaction.html');
    });

    // send a new transaction
    app.post('/transactions/send', (req, res) => {
        // create a new transaction
        if (req.body.fee >= 10 && req.body.from != null && req.body.to != null) {
            const newTXN = new Transaction(req.body.from, req.body.to, req.body.value, req.body.fee, createDate(), req.body.data, req.body.senderPubKey);
            // sign 
            newTXN.signTransaction(req.body.senderPrivKey, req.body.scrtMsg);

            // submit txn
            MIEWCOIN_BLOCKCHAIN.addTransaction(newTXN);
        } else {
            res.send("Sorry, your transaction is missing either a to or from address or the fee is not greater than 10 micro coins");
        }
        // console.log("congragulations! Transaction was sent");
        res.send();
    });

    // get all??? balances ** need to do **
    app.get('/balances', (req, res) => {
        res.send();
    });

    // get all transactions for a specific address ** need to change from req.body.address to use the http **
    app.get('/address/:address/transactions', (req, res) => {
        const transactions = MIEWCOIN_BLOCKCHAIN.getTransactionsForAddress(req.body.address);
        res.send(transactions);
    });

    // get the balance for a specific address ** need to change from req.body.address to use the http **
    app.get('/address/:address/balance', (req, res) => {
        const balance = MIEWCOIN_BLOCKCHAIN.getBalanceOfAddress(req.body.address);
        res.send(balance.toString());
    });    

    // mine pending txns to mine the next block ** working on miner reward transaction **
    app.post('/minePendingTransactions', (req, res) => {
        // submit miners address and init the miner
        MIEWCOIN_BLOCKCHAIN.minePendingTransactions(req.body.miningRewardAddress);
        broadcast(responseLatestMsg());
        res.send();
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
        res.send();
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}

function drawView(res, view, data) {
    res.render('../views/' + view + '.html', data)
}