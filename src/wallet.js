
import { RIPEMD160 } from 'crypto-js';
import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

export function createWallet() {
    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');
    const address = RIPEMD160(publicKey)

    // console.log('here is your address: ' + address);
    // console.log('here is your publicKey: ' + publicKey);
    // console.log('here is your privateKey: ' + privateKey);

    return {
        address,
        publicKey,
        privateKey,
        keyPair
    }
}

export function validateWallet(privateKey, publicKey) {
    const key = ec.keyFromPrivate(privateKey);

    // Derive the public key from the private key
    const publicKeyFromPrivate = key.getPublic('hex');

    return publicKeyFromPrivate === publicKey;
}