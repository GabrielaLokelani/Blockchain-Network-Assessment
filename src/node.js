
'use strict';

// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const path = require('path')
const bodyParser = require('body-parser');
import { MIEWCOIN_BLOCKCHAIN } from '../index';
import { createDate } from './block';
import { http_port } from './server';

const p2p_port = process.env.P2P_PORT || 3333;
export const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export let nodeMap = new Map();
export let peerMap = new Map();
export var peerPool = [];
export var sockets = [];
export let MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

export default class Node {
    constructor(selfURL, p2p, peers, chain) {
        this.nodeID = this.calculateNodeID(),
        this.selfURL = selfURL,
        this.p2p = p2p,
        this.peers = peers,
        this.chain = chain
    }

    calculateNodeID() {
        let date = createDate();
        let random = Math.floor(Math.random() * 1000);
        return CryptoJS.SHA256(date.toString() + random.toString()).toString();
    }
}

// create the P2P server to let nodes interact
export let initP2PServer = () => {
    let server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('Listening websocket p2p on port: ' + p2p_port);
};

export function createNode() {
    let node = new Node(`http://localhost:${http_port}`, `http://localhost:${p2p_port}`, peerPool, "6f744571155652ae36dafbb6272f7949eae93369325e5e34da72d07e6d8bce1c");
    // console.log("Here is the node after creation: ", node);
    let nodeString = JSON.stringify(node);
    nodeMap.set(`${node.nodeID}`, `${nodeString}`);
    return node
}

export let node = createNode()

// handle the blockchain and responses for the nodes when a new event occurs
let handleBlockchainResponse = (message) => {
    let receivedBlocks = JSON.parse(message.data);
    if (!receivedBlocks.chain) {
        receivedBlocks.sort(function(a, b) { 
            return a.index - b.index;
        });
    } else {
        receivedBlocks = receivedBlocks.chain;
        receivedBlocks.sort(function(a, b) { 
            return a.index - b.index;
        });
    }
    let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    let latestBlockHeld = MIEWCOIN_BLOCKCHAIN.getBlock(MIEWCOIN_BLOCKCHAIN.getHeight());
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.blockHash === latestBlockReceived.previousBlockHash) {
            console.log("We can append the received block to our chain");
            MIEWCOIN_BLOCKCHAIN.addBlock(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            MIEWCOIN_BLOCKCHAIN.replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Recieved message: ' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
        peerPool.splice(peerPool.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

let initConnection = (ws, nodeID) => {
    sockets.push(ws);
    if (ws.url){
        addToPeerPool(ws.url, nodeID);
    }
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

function addToPeerPool(wsURL, nodeID) {
    wsURL = wsURL.substring(2);
    let str = "https"
    let p2p = str.concat(wsURL);
    peerMap.set(`${nodeID}`, `${p2p}`);
    let connection = {
        NodeId: nodeID,
        P2P_Port: p2p
    }
    peerPool.push(connection);
}

export let connectToPeers = (newPeers, nodeID) => {
    newPeers.forEach((peer) => {
        let ws = new WebSocket(peer);
        console.log("Peer is being connected: ", peer);
        ws.on('open', () => initConnection(ws, nodeID));
        ws.on('error', () => {
            console.log('connection failed')
        });
        return peer
    });
};

export let queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
export let queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
export let responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(MIEWCOIN_BLOCKCHAIN)
});
export let responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([MIEWCOIN_BLOCKCHAIN.getBlock(MIEWCOIN_BLOCKCHAIN.getHeight())])
});

let write = (ws, message) => ws.send(JSON.stringify(message));
export var broadcast = (message) => sockets.forEach(socket => write(socket, message));

// function getChain() {
//     let genesisHash = MIEWCOIN_BLOCKCHAIN.chain[0].blockHash;
//     console.log("here is the genesis hash: ", genesisHash);
//     return genesisHash
// }