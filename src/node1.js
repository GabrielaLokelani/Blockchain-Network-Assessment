
// 'use strict';

// // IMPORT RELEVANT LIBRARIES
// const CryptoJS = require('crypto-js');
// const express = require('express');
// const WebSocket = require('ws');
// const bodyParser = require('body-parser');

// import BlockChain from "./chain";
// import Transaction from "./transaction";
// import { createDate } from './block';
// import { createWallet, validateWallet, keyPairFromPriv } from "./wallet";
// import { MIEWCOIN_BLOCKCHAIN } from '../index'

// const http_port = process.env.HTTP_PORT || 5555;
// const p2p_port = process.env.P2P_PORT || 6001;
// export const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// var sockets = [];
// let MessageType = {
//     QUERY_LATEST: 0,
//     QUERY_ALL: 1,
//     RESPONSE_BLOCKCHAIN: 2
// };


// // rest api logic for blocks, createWallet, pendingTransactions, minePendingTransactions, peers, still fixing sendTransaction
// export function initHttpServer() {
//     let app = express();
//     app.use(bodyParser.json());

//     const myWallet = createWallet();
//     console.log('MyWallet: address: ' + myWallet.address + '\n' + 'myWallet publicKey: ' + myWallet.pubKey + '\n' + 'myWallet publicKeyCompressed: ' + myWallet.publicKeyCompressed + '\n' + 'myWalet privateKey: ' + myWallet.privateKey);
//     const jakeWallet = createWallet();
//     console.log('jakeWallet: address: ' + jakeWallet.address + '\n' + 'jakeWallet publicKey: ' + jakeWallet.pubKey + '\n' +  'jakeWallet publicKeyCompressed: ' + jakeWallet.publicKeyCompressed + '\n' + 'jakeWallet privateKey: ' + jakeWallet.privateKey);
//     // console.log("is myWallet privateKey equal to publicKey?", validateWallet(jakeWallet.privateKey, jakeWallet.publicKey));

//     app.get('/', (req, res) => {
//         res.send("Welcome! Here is the latest block thats been added to the chain:" + JSON.stringify(MIEWCOIN_BLOCKCHAIN.getBlock(MIEWCOIN_BLOCKCHAIN.getHeight())))
//     })

//     // get all blocks in the blockchain
//     app.get('/blocks', (req, res) => res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN)));

//     // get a specific block by its index *** currently having to use req.body.idex need to figure out how to do through http :)
//     app.get('/blocks/{:index}', (req, res) => {
//         res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.getBlock(req.body.index)));
//     });

//     // create a new wallet and return the public and private keys
//     app.post('/createWallet', (req, res) => {
//         let newWallet = createWallet();
//         res.send({ 'address:': newWallet.address, "pubKey": newWallet.pubKey, "publicKeyCompressed": newWallet.publicKeyCompressed, "privKey": newWallet.privateKey});
//     });

//     // get all pending transactions
//     app.get('/transactions/pending', (req, res) => {
//         res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN.pendingTransactions));
//     })

//     // get all confirmed transactions 
//     app.get('/transactions/confirmed', (req, res) => {
//         const confirmedTXNs = MIEWCOIN_BLOCKCHAIN.getConfirmedTransactions();
//         res.send(confirmedTXNs);
//     });

//     // get specific transaction by its hash 
//     app.get('/transactions/:txnHash', (req, res) => {
//         const transaction = MIEWCOIN_BLOCKCHAIN.getTransactionByHash(req.body.txnHash);
//         res.send(transaction);
//     });

//     // send a new transaction
//     app.post('/transactions/send', (req, res) => {
//         // create a new transaction
//         if (req.body.fee >= 10 && req.body.from != null && req.body.to != null) {
//             const newTXN = new Transaction(req.body.from, req.body.to, req.body.value, req.body.fee, createDate(), req.body.data, req.body.senderPubKey);
//             // sign 
//             newTXN.signTransaction(req.body.senderPrivKey, req.body.scrtMsg);

//             // submit txn
//             MIEWCOIN_BLOCKCHAIN.addTransaction(newTXN);
//         } else {
//             res.send("Sorry, your transaction is missing either a to or from address or the fee is not greater than 10 micro coins");
//         }
//         // console.log("congragulations! Transaction was sent");
//         res.send();
//     });

//     // get all??? balances ** need to do **
//     app.get('/balances', (req, res) => {
//         res.send();
//     });

//     // get all transactions for a specific address ** need to change from req.body.address to use the http **
//     app.get('/address/:address/transactions', (req, res) => {
//         const transactions = MIEWCOIN_BLOCKCHAIN.getTransactionsForAddress(req.body.address);
//         res.send(transactions);
//     });

//     // get the balance for a specific address ** need to change from req.body.address to use the http **
//     app.get('/address/:address/balance', (req, res) => {
//         const balance = MIEWCOIN_BLOCKCHAIN.getBalanceOfAddress(req.body.address);
//         res.send(balance.toString());
//     });    

//     // mine pending txns to mine the next block ** working on miner reward transaction **
//     app.post('/minePendingTransactions', (req, res) => {
//         // submit miners address and init the miner
//         MIEWCOIN_BLOCKCHAIN.minePendingTransactions(req.body.miningRewardAddress);
//         broadcast(responseLatestMsg());
//         res.send();
//     });

//     // reset the chain for debugging purposes
//     app.post('/resetChain', (req, res) => {
//         let MIEWCOIN_BLOCKCHAIN = new BlockChain();
//         res.send(JSON.stringify(MIEWCOIN_BLOCKCHAIN));
//     })

//     // get array of connected peers
//     app.get('/peers', (req, res) => {
//         res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
//     });

//     // add a peer to the network
//     app.post('/peers/connect', (req, res) => {
//         connectToPeers([req.body.peer]);
//         res.send();
//     });

//     // notify peers of new block ** need to do **
//     app.post('/peers/notify-new-block', (req, res) => {
//         broadcast(responseLatestMsg());
//         res.send();
//     });

//     app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
// }

// export let initP2PServer = () => {
//     let server = new WebSocket.Server({port: p2p_port});
//     server.on('connection', ws => initConnection(ws));
//     console.log('listening websocket p2p port on: ' + p2p_port);

// };

// let handleBlockchainResponse = (message) => {
//     let receivedBlocks = JSON.parse(message.data);
//     if (!receivedBlocks.chain) {
//         receivedBlocks.sort(function(a, b) { 
//             return a.index - b.index;
//         });
//     } else {
//         receivedBlocks = receivedBlocks.chain;
//         receivedBlocks.sort(function(a, b) { 
//             return a.index - b.index;
//         });
//     }
//     // let receivedBlocks = JSON.parse(message.data).sort(function(a, b) { 
//     //     return a.index - b.index;
//     // });
//     let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
//     let latestBlockHeld = MIEWCOIN_BLOCKCHAIN.getBlock(MIEWCOIN_BLOCKCHAIN.getHeight());
//     if (latestBlockReceived.index > latestBlockHeld.index) {
//         console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
//         if (latestBlockHeld.blockHash === latestBlockReceived.previousBlockHash) {
//             console.log("We can append the received block to our chain");
//             MIEWCOIN_BLOCKCHAIN.addBlock(latestBlockReceived);
//             broadcast(responseLatestMsg());
//         } else if (receivedBlocks.length === 1) {
//             console.log("We have to query the chain from our peer");
//             broadcast(queryAllMsg());
//             // console.log("here are the received blocks:   " + JSON.stringify(receivedBlocks))
//         } else {
//             console.log("Received blockchain is longer than current blockchain");
//             MIEWCOIN_BLOCKCHAIN.replaceChain(receivedBlocks);
//         }
//     } else {
//         console.log('received blockchain is not longer than current blockchain. Do nothing');
//     }
// };

// var initMessageHandler = (ws) => {
//     ws.on('message', (data) => {
//         var message = JSON.parse(data);
//         console.log('Recieved message: ' + JSON.stringify(message));
//         switch (message.type) {
//             case MessageType.QUERY_LATEST:
//                 write(ws, responseLatestMsg());
//                 break;
//             case MessageType.QUERY_ALL:
//                 write(ws, responseChainMsg());
//                 break;
//             case MessageType.RESPONSE_BLOCKCHAIN:
//                 handleBlockchainResponse(message);
//                 break;
//         }
//     });
// };

// var initErrorHandler = (ws) => {
//     var closeConnection = (ws) => {
//         console.log('connection failed to peer: ' + ws.url);
//         sockets.splice(sockets.indexOf(ws), 1);
//     };
//     ws.on('close', () => closeConnection(ws));
//     ws.on('error', () => closeConnection(ws));
// };

// let initConnection = (ws) => {
//     sockets.push(ws);
//     initMessageHandler(ws);
//     initErrorHandler(ws);
//     write(ws, queryChainLengthMsg());
// };

// export let connectToPeers = (newPeers) => {
//     newPeers.forEach((peer) => {
//         let ws = new WebSocket(peer);
//         ws.on('open', () => initConnection(ws));
//         ws.on('error', () => {
//             console.log('connection failed')
//         });
//     });
// };

// let queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
// let queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
// let responseChainMsg = () =>({
//     'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(MIEWCOIN_BLOCKCHAIN)
// });
// export let responseLatestMsg = () => ({
//     'type': MessageType.RESPONSE_BLOCKCHAIN,
//     'data': JSON.stringify([MIEWCOIN_BLOCKCHAIN.getBlock(MIEWCOIN_BLOCKCHAIN.getHeight())])
// });

// let write = (ws, message) => ws.send(JSON.stringify(message));
// export var broadcast = (message) => sockets.forEach(socket => write(socket, message));