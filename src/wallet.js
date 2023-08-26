
import { RIPEMD160 } from 'crypto-js';
import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

// create a new wallet
export function createWallet() {
    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic();
    const publicKeyCompressed = publicKey.encodeCompressed("hex");
    const privateKey = keyPair.getPrivate('hex');
    const pubKey = keyPair.getPublic('hex');
    const address = RIPEMD160(pubKey).toString();

    // console.log('here is your address: ' + address);
    // console.log('here is your publicKey: ' + publicKey);
    // console.log('here is your privateKey: ' + privateKey);
    // console.log('here is your KeyPair: ' + JSON.stringify(keyPair));

    return {
        address,
        pubKey,
        publicKeyCompressed,
        privateKey,
        keyPair
    }
}

// check to see if wallet is valid using public and private keys
export function validateWallet(privateKey, publicKey) {
    const key = ec.keyFromPrivate(privateKey);

    // Derive the public key from the private key
    const publicKeyFromPrivate = key.getPublic('hex');

    return publicKeyFromPrivate === publicKey;
}

// extract the keypair from private key input
export function keyPairFromPriv(privKey) {
    const key = ec.keyFromPrivate(privKey);
    // console.log("here is the supposed generated key from private: " + JSON.stringify(key));
    return key;
}

export function openWallet(privKey) {
    const keyPair = ec.keyFromPrivate(privKey);
    const publicKey = keyPair.getPublic();
    const publicKeyCompressed = publicKey.encodeCompressed("hex");
    const privateKey = keyPair.getPrivate('hex');
    const pubKey = keyPair.getPublic('hex');
    const address = RIPEMD160(pubKey).toString();
    return {
        address,
        pubKey,
        publicKeyCompressed,
        privateKey,
    }
}