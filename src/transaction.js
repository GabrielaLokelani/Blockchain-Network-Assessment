
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var crypto = require('crypto')
// var ecdsa = require('ecdsa');
import { keyPairFromPriv } from "./wallet";

// (*** simplified for now, add extra params later ***)
export default class Transaction {
    constructor(from, to, value, fee, dateCreated, data, senderPubKey, senderPrivKey) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.fee = fee;
        this.dateCreated = dateCreated;
        this.data = data;
        this.senderPubKey = senderPubKey;
        this.senderPrivKey = senderPrivKey;
    }

    calculateTransactionHash() {
        return CryptoJS.SHA256(this.from + this.to + this.value + this.fee + this.dateCreated + this.data + this.senderPubKey).toString();
    }

    // sign the transaction with the private key
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
        // console.log("Here is the hashed secret msg hash:   " + msg);

        // const msg = CryptoJS.HmacSHA256(scrtMsg);
        // const sign = signingKey.sign(msg, privateKey, 'base64');
        // console.log("you have reached the signing:  " + sign);

        var signature = ec.sign(msg, privateKey, {canonical: true});

        let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
        let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(msg), signature, signature.recoveryParam, "hex");
        console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));

        var isValid = ec.verify(msg, signature, pubKeyRecovered);
        console.log("Is this a valid signature?   " + isValid) //true

        // signature to DER format? ** currently not in DER format but can change with solution below :)
        // this.signature = signature.toDER('hex');
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
        // // fromAddress to get the public key (this process is reversible, as it is just a format conversion process.)
        // const publicKey = ec.keyFromPublic(this.senderPubKey, 'hex');
        // // Use the public key to verify if the signature is correct, or more specifically if the transaction was actually initiated from fromAddress.
        // return publicKey.verify(this.calculateTransactionHash(), this.signature);

        let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
        let pubKeyRecovered = ec.recoverPubKey(hexToDecimal(this.scrtMsg), this.signature, this.signature.recoveryParam, "hex");
        console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));

        var isValid = ec.verify(this.scrtMsg, this.signature, pubKeyRecovered);
        console.log("Is this a valid signature from isValid() ?   " + isValid) //true
    }
}