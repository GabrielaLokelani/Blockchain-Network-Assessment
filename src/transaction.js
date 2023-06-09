
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// (*** simplified for now, add extra params later ***)
export default class Transaction {
    constructor(from, to, value, fee, dateCreated, data, senderPubKey) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.fee = fee;
        this.dateCreated = dateCreated;
        this.data = data;
        this.senderPubKey = senderPubKey;
    }

    calculateTransactionHash() {
        return CryptoJS.SHA256(this.from + this.to + this.value + this.fee + this.dateCreated + this.data + this.senderPubKey).toString();
    }

    signTransaction(signingKey) {
        // check miner tx is valid
        if (this.from === null) return true;

        // verify source account is person's address
        if (signingKey.getPublic('hex') !== this.senderPubKey) {
            throw new Error('Sorry, you cannot sign transactions from a foreign wallet!');
        }

        // sign tx hash w/ private key
        this.transactionHash = this.calculateTransactionHash();

        const sign = signingKey.sign(this.transactionHash, 'base64');

        // signature to DER format
        this.signature = sign.toDER('hex');

        // console.log('signature: ' + this.signature);
    }

    isValid() {
        // if miner fee transaction fromAddress is empty, verification cannot be completed.
        if (this.from === null) return true;
        // Determine if the signature exists
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        // fromAddress to get the public key (this process is reversible, as it is just a format conversion process.)
        const publicKey = ec.keyFromPublic(this.senderPubKey, 'hex');
        // Use the public key to verify if the signature is correct, or more specifically if the transaction was actually initiated from fromAddress.
        return publicKey.verify(this.calculateTransactionHash(), this.signature);
    }
}