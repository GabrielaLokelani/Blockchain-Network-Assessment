// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var crypto = require('crypto');
import { keyPairFromPriv } from "./wallet";

// create the transaction class which each new transaaction will follow
export default class Transaction {
    constructor(from, to, value, fee, dateCreated, data, senderPubKey, senderPrivKey) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.fee = fee;
        this.dateCreated = dateCreated;
        this.data = data;
        this.senderPubKey = senderPubKey;
    }

    // calculate the hash for the transaction using cryptoJS and SHA256
    calculateTransactionHash() {
        let data =  this.data.replaceAll(" ", "");
        return CryptoJS.SHA256(this.from + this.to + this.value + this.fee + this.dateCreated + data + this.senderPubKey).toString();
    }

    // sign the transaction with the private key and a secret message
    signTransaction(privateKey, scrtMsg) {
        // check miner tx is valid
        if (this.from === null) return true;

        // extract the keypair from private key
        const signingKey = keyPairFromPriv(privateKey);

        // verify source account is person's address
        const publicKey = signingKey.getPublic();
        const publicKeyCompressed = publicKey.encodeCompressed("hex");
        if (publicKeyCompressed !== this.senderPubKey) {
            throw new Error('Sorry, you cannot sign transactions from a foreign wallet!');
        }

        // sign tx hash w/ private key amd secret msg hashed
        this.transactionHash = this.calculateTransactionHash();
        var msg = crypto.createHash("sha256").update(scrtMsg.toString()).digest();

        // const msg = CryptoJS.HmacSHA256(scrtMsg);
        // const sign = signingKey.sign(msg, privateKey, 'base64');
        // console.log("you have reached the signing:  " + sign);

        // crate signature
        var signature = ec.sign(msg, privateKey, {canonical: true});

        let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
        let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(msg), signature, signature.recoveryParam, "hex");

        // verify the signature is valid
        var isValid = ec.verify(msg, signature, pubKeyRecovered);
        console.log("Is this a valid signature?   " + isValid);

        // signature to DER format? ** currently not in DER format but can change with solution below :)
        // this.signature = signature.toDER('hex');

        // connect created signature to signature element of transaction
        this.signature = signature;
    }

    signRewardTransaction(privateKey) {
        this.transactionHash = this.calculateTransactionHash();
        this.signature = privateKey;
    }

    isValid() {
        // if miner fee transaction fromAddress is empty, verification cannot be completed.
        if (this.from === null) return true;
        // Determine if the signature exists
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        // 
        let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
        let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(this.scrtMsg), this.signature, this.signature.recoveryParam, "hex");
        console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));

        // use ec verify to verify the signature with message and recovered public key
        var isValid = ec.verify(this.scrtMsg, this.signature, pubKeyRecovered);
        console.log("Is this a valid signature from isValid() ?   " + isValid); //true
    }
}