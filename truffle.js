// Allows us to use ES6 in our migrations and tests.
require('babel-register')
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
    networks: {
        ganache: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*' // Match any network id
        },
        ropsten: {
            provider: () => new HDWalletProvider("YOUR MNEMONIC HERE", "https://ropsten.infura.io/8c6bf67b85944b9fb36c4bf2670031e7"),
            network_id: 3
        }
    }
}
