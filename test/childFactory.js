var ChildFactory = artifacts.require('./ChildFactory.sol');

contract('ChildFactory', function (accounts) {
    it('should send 1 ETH to the contract', function () {
        var child;
        return ChildFactory.deployed().then(function (instance) {
            child = instance;
            return child.send(1, {from: accounts[0]});
        }).then(function () {
            return web3.eth.getBalance(child.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 1, "child contract does not contain the 1 ETH sent");
        })
    })
    it('should withdraw 1 ETH from the contract', function () {
        var child;
        return ChildFactory.deployed().then(function (instance) {
            child = instance;
            return child.withdraw();
        }).then(function () {
            return web3.eth.getBalance(child.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "child contract balance should be empty");
        })
    })
    /*it('should fail when anyone (except the owner) try to withdraw', function () {
        return ChildFactory.deployed().then(async function (instance) {
            await child.send(1, {from: accounts[0]});
            try {
                await instance.withdraw({from: accounts[1]});
                assert(false);
            } catch(e) {
                assert(true);
            }
        })
    })*/
})
