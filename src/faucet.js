// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var crypto = require('crypto');
const express = require('express');
const WebSocket = require('ws');
const path = require('path')
const bodyParser = require('body-parser');
import BlockChain from "./chain";
import Transaction from "./transaction";
import { createDate } from './block';
import { createWallet, validateWallet, keyPairFromPriv } from "./wallet";
import { MIEWCOIN_BLOCKCHAIN } from '../index';

const http_port = process.env.HTTP_PORT || 7777;

export const faucetWallet = createWallet();

console.log("here is the faucet wallet address: " + faucetWallet.address);
console.log("here is the faucet wallet publicKey compressed: " + faucetWallet.publicKeyCompressed);
console.log("here is the faucet wallet privateKey: " + faucetWallet.privateKey);

export function faucetTransaction(toAddress, requestAmount) {
    if (requestAmount <= 1000000 && toAddress) {
        const faucetTXN = new Transaction(faucetWallet.address, toAddress, requestAmount, 0, createDate(), "faucet tx", faucetWallet.publicKeyCompressed);
        faucetTXN.signTransaction(faucetWallet.privateKey, "fromTheFaucet!");
        MIEWCOIN_BLOCKCHAIN.pendingTransactions.push(faucetTXN);
    }
    return true;
}

export function initFaucetServer() {
    let app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);
    app.use(express.static('public'));

        // get faucet page
        app.get('/faucet', (req, res) => {
            res.render('../views/faucet.html');
        });
    
        app.post('/faucet', (req, res) => {
            faucetTransaction(req.body.toAddress, req.body.requestAmount);
        });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));    
}

