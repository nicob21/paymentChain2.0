# Multi Address Payment System
Nicolas BERNARD

## Presentation
Imagine a website that sell articles and wants to allow its clients to pay with ETH providing one account to each of them.
The Master smart-contract can create new child accounts so the clients send ETH to them. Then the Master contract withdraw the funds of the children and can transfer it to its owner.
Having one account for each client makes it easier to manage the incoming payments. Each payment is received on a different account that can be linked to a client.

## How it works
Below, some details about how the smart-contracts works.
+ In order to generate one address per client, we use a Master smart-contract that deploy a child smart-contract on the ChildFactory.sol model.
+ The Master smart-contract is the owner of every child contract and is the only one that can execute the withdrawal function of the child.
+ The child contracts also have an event that is send every time the contract receive or transfer some ETH so the webpage can automatically update the amount of the different accounts.
+ The fallback function allows the contract to receive some ETH directly, sending a transaction to its address.

## Run the app
+ **Step1 -** ​ First you need to install Truffle (version > 5.0.0, truffle@5.0.0-beta.2 at this time) `npm install -g truffle`

+ **Step2 -** Install the node modules running `npm install`

**With Ganache:**

+ **Step3 -** ​ Install and run `ganache-cli --mnemonic xxxx` (specify your Metamask mnemonic).

+ **Step4 -** ​ Migrate the contracts on your Ganache network running `truffle migrate --network ganache`

**With Ropsten:**

+ **Step3 -** ​ Specify your Metamask mnemonic in `truffle.js` file.

+ **Step4 -** ​ Migrate the contracts on Ropsten network running `truffle migrate --network ropsten`

**Run the server:**

+ **Step5 -** ​ Run `npm run dev` and go to `localhost:8080`

+ **Step6 -**  Configure your Metamask wallet on the right network: localhost:8545 (Ganache) or Ropsten.

+ **Step7 -**  You can also run the contracts tests: `truffle test`
