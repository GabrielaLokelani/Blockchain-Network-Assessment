
'use strict';

// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

import BlockChain from "./chain";
import Transaction from "./transaction";
import { createWallet, validateWallet } from "./wallet";

const http_port = process.env.HTTP_PORT || 5555;
const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var sockets = [];
let MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

// initialize the new blockcahin
const MIEWCOIN_BLOCKCHAIN = new BlockChain()

const myWallet = createWallet();
console.log('MyWallet: address: ' + myWallet.address + '\n' + 'myWallet publicKey: ' + myWallet.publicKey + '\n' + 'myWaalet privateKey: ' + myWallet.privateKey + '\n' + 'myWaalet keypair:' + myWallet.keyPair);
const jakeWallet = createWallet();
console.log('jakeWallet: address: ' + jakeWallet.address + '\n' + 'jakeWallet publicKey: ' + jakeWallet.publicKey + '\n' + 'myWaalet privateKey: ' + jakeWallet.privateKey + '\n' + 'myWaalet keypair:' + jakeWallet.keyPair);
console.log("is myWallet privateKey equal to publicKey?", validateWallet(jakeWallet.privateKey, jakeWallet.publicKey));

// init transaction and send 50 coins to jakes wallet
const txn1 = new Transaction(myWallet.address, jakeWallet.address, 50, 20, Date.now(), 'first transaction data!', myWallet.publicKey);

// sign 
txn1.signTransaction(myWallet.keyPair);

// submit txn
MIEWCOIN_BLOCKCHAIN.addTransaction(txn1);

// rest api logic for blocks, createWallet, pendingTransactions, minePendingTransactions, peers, still fixing sendTransaction
export function initHttpServer() {
    let app = express();
    app.use(bodyParser.json());

    // get all blocks in the blockchain
    app.get('/blocks', (req, res) => res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN)));

    // create a new wallet and return the public and private keys
    app.post('/createWallet', (req, res) => {
        let newWallet = createWallet();
        console.log('testing new console.log');
        console.log('New wallet! ' + 'address: ' + newWallet.address + ' pubKey: ' + newWallet.publicKey + ' privKey: ' + newWallet.privateKey + ' ' + 'keyPair: ' + newWallet.keyPair);
        res.send({ "pubKey": newWallet.publicKey, "privKey": newWallet.privateKey });
    });

    // get all pending transactions
    app.get('/transactions/pending', (req, res) => {
        res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.pendingTransactions))
    })

    app.post('/transactions/send', (req, res) => {
        // init transaction and send 50 coins to jakes wallet
        const newTXN = new Transaction(req.body.from, req.body.to, req.body.value, req.body.fee, Date.now(), req.body.data, req.body.senderPubKey);

        // sign 
        // issue with signing, for some reason thinks it is foreign wallet
        newTXN.signTransaction(myWallet.keyPair);
        console.log("signTransaction signkey NODE:" + myWallet.keyPair);

        // submit txn
        MIEWCOIN_BLOCKCHAIN.addTransaction(newTXN);
        console.log("congragulations! Transaction was sent");
        res.send();
    });

    // mine pending txns to mine the next block
    app.post('/minePendingTransactions', (req, res) => {
    // MIEWCOIN_BLOCKCHAIN.minePendingTransactions(myWallet.publicKey);
    MIEWCOIN_BLOCKCHAIN.minePendingTransactions(req.body);
    res.send()
    });

    app.post('/resetChain', (req, res) => {
        const MIEWCOIN_BLOCKCHAIN = new BlockChain();
        res.send();
    })

    // get array of connected peers
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/addPeer', (req, res) => {
        res.send();
    })

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}
