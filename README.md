# Blockchain-Network-Assessment
## Welcome to the MIEWCOIN Blockchain!

### About
Welcome to my personal practical project where I will be building my own blockchain network! 
In this project I will Implement a fully-functional blockchain network consisting of:
+ Nodes (peer-to-peer communication, blocks, transactions, consensus, REST API),
+ Mining software (proof-of-work),
+ Wallet software (handle private keys + sign and send transactions), 
+ Faucet app (to request free coins) and a 
+ Block Explorer app (to browse the blocks and transactions).

**DEPENDENCIES**
+ NodeJS v18.15.0 [NodeJS Download](https://nodejs.org/en/download/releases/)
+ NPM v9.5.0
+ Express v4.18.2
+ CryptoJS v4.1.1
+ Crypto v1.0.1
+ Elliptic v6.5.4
+ ECDSA v0.7.0
+ EJS v3.1.9
+ ESM v3.2.25
+ MathJS v11.10.0
+ WS v8.11.0
+ Body Parser v1.20.1

Lets get this Meowchain going, don't stop meowing!!!

### Getting Started

**STARTING THE APP**
1. Open the repo locally and open the commnand line at the project file path
   - Install all the dependencies that are listed above
     - Run `npm install`
   - Check to make sure dependencies got installed
2. To get the application started, run the first or "main" node
   - Open the command line to start the main node with the http port: 5555, faucet port: 7777, and p2p port: 3333
     - Run `HTTP_PORT=5555 P2P_PORT=3333 FAUCET_PORT=7777 npm start`
   - The http and faucet ports are already pre-set for this main node, so the p2p port may be some other number above 3000
3. To start other nodes from the console
   - Open a new separate terminal in the project file path 
   - Pick three new port numbers that are different from the ports in use for the main node for the other node's http, p2p, and faucet port
   - Now to connect to a seperate node also include the Websocket connection
     - `PEERS=ws://localhost:{p2p port of the node you wish to connect to}`
   - For example: 
     - Run `HTTP_PORT=6666 P2P_PORT=4444 FAUCET_PORT=8888 PEERS=ws://localhost:3333 npm start`


### Usage Instructions

**HOMEPAGE**
1. In the browser go to:
   - [HOMEPAGE](http://127.0.0.1:5555/home) To access the homepage of the application
   - From the `/home` endpoint the user can access the:
     - Block Explorer
     - Wallet
     - Faucet
     - Miner

**BLOCK EXPLORER**
- From the homepage, the **"Block Explorer"** tab or or `/blockExplorer` endpoint will lead to the explorer's hub
- The **"Blockchain"** tab or `/block` endpoint
  - This leads to a page where the user can see the entire blockchain
- The **"Block By Index"** tab or `/blockIndex/:index` endpoint
  - This leads to a page where the user can see a specific block in the blockchain using the block's index
  - Replace `:index` with the index of the block you wish to see
- The **"Pending Transactions"** tab or `/transactions/pending` endpoint
  - This leads to a page where the user can see the blockchain's pending transactions array
- The **"Confirmed Transactions"** tab or `/transactions/confirmed` endpoint
  - This leads to a page where the user can see the blockchain's blocks without the pending transactions 
- The **"Transaction By Hash"** tab or `/transactionHash/:txnHash` endpoint
  - This leads to a page where the user can see a specified transaction using it's transaction hash
  - Replace `:txnHash` with the transaction hash of the transaction you wish to see
- The **"Balances"** tab or `/balances` endpoint
  - This leads to a page where the user can see all of the confirmed balances with their corresponding address
- The **"Balance By Address"** tab or `/address/:address/balance` endpoint
  - This leads to a page where the user can see the confirmed, safe, and pending balances to an address
    - Confirmed Balance = the balance total where there are six or more following blocks
    - Safe Balance = the balance total where there is one or more following blocks
    - Pending Balance = the balance total of all blocks and assuming all pending transactions are successfull 
  - Replace `:address` with the address for the user whom balances you wish to see
- The **"Transactions By Address"** tab or `/address/:address/transactions` endpoint
  - This leads to a page where the user can see all the transactions that belong to an address, in the chain or pending
  - Replace `:address` with the address of the user whom transactions you wish to see
- The **"Peers"** tab or `/peers` endpoint
  - This leads to a page where the user can see the peers array and which peers are connected

**WALLET**
- From the homepage, the Wallet tab or or `/wallet` endpoint will lead to the wallet hub
- The **"Create Wallet"** tab or `/createWallet` endpoint
  - This leads to a page where the user can create a new wallet and recieve the:
    - Address
    - Public Key
    - Compressed Public Key
    - Private Key
- The **"Open Wallet"** tab or `/openWallet` endpoint
  - This leads to a page where the if the user already has an existing wallet private key, they can unlock and view their wallet's details like in /createWallet
  - Fill in the Private Key input and press the unlock button to get the wallet's information
- The **"Send Transaction"** tab or `/transaction/send` endpoint
  - This leads to a page where the user can send a transaction
  - Fill in the form with:
    - From Address: the address you wish to send a transaction from 
    - To Address: the address you wish to send the funds to 
    - Value: the amount of MiewCoin you wish to send
    - Fee: the fee for the miners to mine your transaction, must be at least 10 micro Miews
    - Data: the message string to label your transaction 
      - For example: `For rent`
    - Public Key: the _compressed_ public key which corresponds to the "From Address"
- The **"Balance"** tab or `/address/:address/balance` endpoint
  - This is identical to the "Balance By Address" tab in the Block Explorer
  - This leads to a page where the user can see the confirmed, safe, and pending balances to their address
    - Confirmed Balance = the balance total where there are six or more following blocks
    - Safe Balance = the balance total where there is one or more following blocks
    - Pending Balance = the balance total of all blocks and assuming all pending transactions are successfull 
  - Replace `:address` with the users address to see their balances
- The **"Transactions"** tab or `/address/:address/transactions` endpoint
  - This is identical to the "Transactions By Address" tab in the Block Explorer
  - This leads to a page where the user can see all the transactions that belong to their address, in the chain or pending
  - Replace `:address` with the user's address to see their transactions

**FAUCET**
- From the homepage, the **"Faucet"** tab or in the browser go to: [FAUCETPAGE](http://127.0.0.1:7777/faucet) To access the faucet of the application
- The faucet allows users to gain up to 1000000 micro Miews 
- Fill the form out:
  - Enter your Address: input the address you wish you recieve coins from the faucet
  - Request Amount: input the number of micro Miews you wish to recieve, which must be no more than 1000000 mirco Miews
  - [X] Check the reCAPTCHA validation 
  - Click the "Send" button to send the faucet transaction
- The user then recieves their transaction hash for the faucet transaction 
- To return to the Homepage select the "MiewCoin Blockchain Network" tab in the faucet nav bar

**MINER**
- From the homepage, the Miner tab or or `/miner` endpoint will lead to the miner hub
- The **"Get Mining Job"** tab or `/getMiningJob/:minerAddress` endpoint
  - Replace `:minerAddress` with the address you wish to recieve the mining reward
  - This leads to a page where the user can get the information about the block the user is about to mine through the block candidate
  - Displays the:
    - Block Candidate Information: the information about the block candidate including:
      - Index
      - Transactions Included
      - Difficulty
      - Expected Reward
      - Reward Address
      - Block Data Hash
    - Block Candidate: the full JSON object of the block candidate
      - Will look like any other block except it does not have the BlockHash, Nonce, or DateCreated values which will be mended once the block is mined
  - By clicking the "Mine" button users can mine that block candidate and recieve the candidates missing values BlockHash, Nonce, and DateCreated to submit 
- The **"Submit Mined Block"** tab or `/submitMinedBlock` endpoint
  - This leads to a page where the user can input their newly mined block candidate details to hopefully become the miner for the next block
  - Fill in the form with:
    - Mined Block Hash: the blockHash of your newly mined block
    - Date Created: the dateCreated value from the mined block
    - Nonce: the nonce number from the newly mined block 
    - Block Data Hash: the blockDataHash from the mined block or from the block candidate information of the block the user mined
  - Click "Submit" to submit your newly mined block information to be mended to the block candidate stored with the blockDataHash and see if the user was the fastest miner to get the reward and add the newest block onto the chain