// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var crypto = require('crypto');
const express = require('express');
const path = require('path')
import Transaction from "./transaction";
import { createDate } from './block';
import { faucetPublicKeyComp, faucetAddress, faucetPrivKey, faucetmsg } from "./faucetWallet";
import { MIEWCOIN_BLOCKCHAIN } from '../index';

const faucetHttp_port = process.env.FAUCET_PORT || 7777;

// create the faucet transaction, sign the faucet transaction, and push to the pendingTranactions pool to be mined
export function faucetTransaction(toAddress, requestAmount) {
    if (requestAmount <= 1000000 && toAddress) {
        const faucetTXN = new Transaction(faucetAddress, toAddress, requestAmount, 0, createDate(), "faucet tx", faucetPublicKeyComp);
        faucetTXN.signTransaction(faucetPrivKey, faucetmsg);
        MIEWCOIN_BLOCKCHAIN.pendingTransactions.push(faucetTXN);
    }
    return true;
}

// create the faucet server for faucet app
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
    
        // get miewcoins from the faucet after putting in address and passing reCAPTCHA validation (see reCAPTCHA in html)
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

// initFaucetServer();
