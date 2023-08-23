// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var crypto = require('crypto');
const express = require('express');
const path = require('path')
import Transaction from "./transaction";
import { createDate } from './block';
import { faucetPublicKeyComp, faucetAddress, faucetPrivKey } from "./faucetWallet";
import { MIEWCOIN_BLOCKCHAIN } from '../index';

const faucetHttp_port = 7777;

export function faucetTransaction(toAddress, requestAmount) {
    if (requestAmount <= 1000000 && toAddress) {
        const faucetTXN = new Transaction(faucetAddress, toAddress, requestAmount, 0, createDate(), "faucet tx", faucetPublicKeyComp);
        faucetTXN.signTransaction(faucetPrivKey, "fromTheFaucet!");
        MIEWCOIN_BLOCKCHAIN.pendingTransactions.push(faucetTXN);
    }
    return true;
}

// for some reason causes issue when a new node starts because it takes the port ie. HTTP_PORT=4000 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
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
            // faucetTransaction(req.body.toAddress, req.body.requestAmount);
            let toAddress = req.body.toAddress;
            let requestAmount = req.body.requestAmount;
            faucetTransaction(toAddress, requestAmount);
        });

    app.listen(faucetHttp_port, () => console.log('Faucet listening http on port: ' + faucetHttp_port));    
}

// function drawView(res, view, data) {
//     res.render('../views/' + view + '.html', data)
// }

            // .then((transaction) => {
            //     drawView(res, 'faucet', {
            //         toAddress: toAddress,
            //         requestAmount: requestAmount
            //     })
            // })

initFaucetServer();