
'use strict';
// IMPORT RELEVANT LIBRARIES
const CryptoJS = require('crypto-js');
const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
import BlockChain from "./src/chain";
import { connectToPeers, initP2PServer, initialPeers} from "./src/node";
import { initHttpServer } from "./src/server";
import { initFaucetServer } from "./src/faucet";

export const MIEWCOIN_BLOCKCHAIN = new BlockChain();
initHttpServer();
connectToPeers(initialPeers);
initP2PServer();
initFaucetServer();