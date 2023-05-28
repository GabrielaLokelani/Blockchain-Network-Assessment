
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

export function initHttpServer() {
    let app = express();
    app.use(bodyParser.json());

    // get all blocks in the blockchain
    app.get('/blocks', (req, res) => res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN)));

    app.post('mineBlock', (req, res) => {
        let newBlock = new Block(req.body.data);
        res.send()
    })

    app.post('/createWallet', (req, res) => {
        let myWallet = createWallet();
        console.log('New wallet! ' + 'address: ' + myWallet.address + 'pubKey: ' + myWallet.publicKey + 'privKey: ' + myWallet.privateKey);
        res.send()
    });

    app.post('/addTransaction', (req, res) => {
        // init transaction and send 50 coins to jakes wallet
        const txn1 = new Transaction(req.body.data);

        // sign 
        txn1.signTransaction(req.body.data);

        // submit txn
        MIEWCOIN_BLOCKCHAIN.addTransaction(txn1);
        res.send();
    });

    // mine pending txns to mine the next block
    app.post('/minePendingTransactions', (req, res) => {
                // init wallets
    const myWallet = createWallet();
    const jakeWallet = createWallet();
    console.log("is myWallet privateKey equal to publicKey?", validateWallet(myWallet.privateKey, myWallet.publicKey));

    // init transaction and send 50 coins to jakes wallet
    const txn1 = new Transaction(myWallet.publicKey, jakeWallet.publicKey, 50, 20, Date.now(), 'first transaction data!');

    // sign 
    txn1.signTransaction(myWallet.keyPair);

    // submit txn
    MIEWCOIN_BLOCKCHAIN.addTransaction(txn1);
    console.log('Starting up miner for block 1... ');
    MIEWCOIN_BLOCKCHAIN.minePendingTransactions(myWallet.publicKey);
    res.send()
    });

    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/addPeer', (req, res) => {
        res.send();
    })

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}
