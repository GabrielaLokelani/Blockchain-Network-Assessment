
import { keyPairFromPriv } from "./wallet";
import { RIPEMD160 } from 'crypto-js';

// extract the faucet wallet via private key, this wallet is needed for the faucet transaction
export const faucetPrivKey = "d7129267f46238a0dc44b8b42ead83ad0a53a622367b816d54d2d6482638ae3f";
export const faucetmsg = "superdupersecret";
const faucetWallet = keyPairFromPriv(faucetPrivKey);
const faucetPublicKey = faucetWallet.getPublic();
export const faucetPublicKeyComp = faucetPublicKey.encodeCompressed("hex");
const faucetPubkey = faucetWallet.getPublic("hex");
export const faucetAddress = RIPEMD160(faucetPubkey).toString();
// console.log("here is the faucet wallet address: " + faucetAddress);
// console.log("here is the faucet wallet publicKey compressed: " + faucetPublicKeyComp);