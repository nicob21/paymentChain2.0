var Master = artifacts.require('./Master.sol');
var ChildFactory = artifacts.require('./ChildFactory.sol');

contract('Master', function (accounts) {
    it('should create one child account', function () {
        var master;
        var childAdd;
        return Master.deployed().then(function (instance) {
            master = instance;
            return master.createChildAccount();
        }).then(function (txResult) {
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            childAdd = txResult.logs[1].args.child;
            return master.getChildAddress(1);
        }).then(function (childAddContract) {
            assert(childAdd, childAddContract, "Child contract address not correct");
            return master.getChildIndex(childAdd);
        }).then(function (childIndex) {
            assert(childIndex, 1, "Child contract index not correct");
            return master.getNbChildren();
        }).then(function (nbChildren) {
            assert(nbChildren.valueOf(), 1, "Master contract should contain one child account");
        })
    })

    it('should create 2 child accounts and delete the first one', function () {
        var master;
        var child1, child2;
        return Master.deployed().then(function (instance) {
            master = instance;
            return master.createChildAccount();
        }).then(function (txResult) {
            child1 = txResult.logs[1].args.child;
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return master.createChildAccount();
        }).then(function (txResult) {
            child2 = txResult.logs[1].args.child;
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return master.getChildIndex(child1);
        }).then(function (index1) {
            assert(index1, 1, "Child 1 index not correct");
            return master.getChildIndex(child2);
        }).then(function (index2) {
            assert(index2, 2, "Child 2 index not correct");
            return master.getChildAddress(1);
        }).then(function (address1) {
            assert(address1, child1, "Child 1 address not correct");
            return master.getChildAddress(2);
        }).then(function (address2) {
            assert(address2, child2, "Child 2 address not correct");
            return master.getNbChildren();
        }).then(function (nbChildren) {
            assert(nbChildren.valueOf(), 2, "Master contract should contain 3 child accounts");
            // Initial accounts are correctly stored
            // Now we delete the second account
            return master.deleteChildAccount(child1);
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "childDeleted", "The Log-Event should be childDeleted");
            return master.getChildIndex(child1);
        }).then(function (index1) {
            assert(index1, 0, "Child 1 index not correct");
            return master.getChildIndex(child2);
        }).then(function (index2) {
            assert(index2, 1, "Child 2 index not correct");
            return master.getChildAddress(1);
        }).then(function (address1) {
            assert(address1, child2, "Child 2 address not correct");
            return master.getNbChildren();
        }).then(function (nbChildren) {
            assert(nbChildren.valueOf(), 1, "Master contract should contain 2 child accounts now");
        })
    })

    it('should create 3 child accounts and delete the second one', function () {
        var master;
        var child1, child2, child3;
        return Master.deployed().then(function (instance) {
            master = instance;
            return master.createChildAccount();
        }).then(function (txResult) {
            child1 = txResult.logs[1].args.child;
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return master.createChildAccount();
        }).then(function (txResult) {
            child2 = txResult.logs[1].args.child;
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return master.createChildAccount();
        }).then(function (txResult) {
            child3 = txResult.logs[1].args.child;
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return master.getChildIndex(child1);
        }).then(function (index1) {
            assert(index1, 1, "Child 1 index not correct");
            return master.getChildIndex(child2);
        }).then(function (index2) {
            assert(index2, 2, "Child 2 index not correct");
            return master.getChildIndex(child3);
        }).then(function (index3) {
            assert(index3, 3, "Child 3 index not correct");
            return master.getChildAddress(1);
        }).then(function (address1) {
            assert(address1, child1, "Child 1 address not correct");
            return master.getChildAddress(2);
        }).then(function (address2) {
            assert(address2, child2, "Child 2 address not correct");
            return master.getChildAddress(3);
        }).then(function (address3) {
            assert(address3, child3, "Child 3 address not correct");
            return master.getNbChildren();
        }).then(function (nbChildren) {
            assert(nbChildren.valueOf(), 3, "Master contract should contain 3 child accounts");
            // Initial accounts are correctly stored
            // Now we delete the second account
            return master.deleteChildAccount(child2);
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "childDeleted", "The Log-Event should be childDeleted");
            return master.getChildIndex(child1);
        }).then(function (index1) {
            assert(index1, 1, "Child 1 index not correct");
            return master.getChildIndex(child2);
        }).then(function (index2) {
            assert(index2, 0, "Child 2 index not correct");
            return master.getChildIndex(child3);
        }).then(function (index3) {
            assert(index3, 2, "Child 3 index not correct");
            return master.getChildAddress(1);
        }).then(function (address1) {
            assert(address1, child1, "Child 1 address not correct");
            return master.getChildAddress(2);
        }).then(function (address2) {
            assert(address2, child3, "Child 3 address not correct");
            return master.getNbChildren();
        }).then(function (nbChildren) {
            assert(nbChildren.valueOf(), 2, "Master contract should contain 2 child accounts now");
        })
    })

    it('should create a child account send ETH to it and withdraw', function () {
        var master, masterBalance;
        var child, childAdd;
        return Master.deployed().then(function (instance) {
            master = instance;
            return master.createChildAccount();
        }).then(function (txResult) {
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            childAdd = txResult.logs[1].args.child;
            return ChildFactory.at(childAdd);
        }).then(function (childInstance) {
            child = childInstance;
            return child.send(1, {from: accounts[1]});
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "ethReceived", "The Log-Event should be ethReceived");
            return web3.eth.getBalance(childAdd);
        }).then(function (balance) {
            assert(balance, 1, "Child balance should be 1ETH");
            return child.send(2, {from: accounts[2]});
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "ethReceived", "The Log-Event should be ethReceived");
            return web3.eth.getBalance(childAdd);
        }).then(function (balance) {
            assert(balance, 3, "Child balance should be 3ETH");
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            masterBalance = balance;
            return master.withdrawAccount(childAdd);
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "masterETHReceived", "The Log-Event should be masterETHReceived");
            return web3.eth.getBalance(master.address);
        }).then(function (newBalance) {
            assert(masterBalance + 3, newBalance, "Transfer to master contract did not work");
        })
    })

    it('should create 3 child accounts, send ETH to them, withdraw them, withdraw master contract', function () {
        var master, masterBalance;
        var child1, child2, child3;
        var accountBalance;
        return Master.deployed().then(function (instance) {
            master = instance;
            return web3.eth.getBalance(accounts[0]);
        }).then(function (balance) {
            accountBalance = balance;
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            masterBalance = balance;
            return master.createChildAccount();
        }).then(function (txResult) {
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return ChildFactory.at(txResult.logs[1].args.child);
        }).then(function (childInstance) {
            child1 = childInstance;
            return child1.send(1, {from: accounts[1]});
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "ethReceived", "The Log-Event should be ethReceived");
            return master.createChildAccount();
        }).then(function (txResult) {
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return ChildFactory.at(txResult.logs[1].args.child);
        }).then(function (childInstance) {
            child2 = childInstance;
            return child2.send(2, {from: accounts[2]});
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "ethReceived", "The Log-Event should be ethReceived");
            return master.createChildAccount();
        }).then(function (txResult) {
            assert(txResult.logs[1].event, "childCreated", "The Log-Event should be childCreated");
            return ChildFactory.at(txResult.logs[1].args.child);
        }).then(function (childInstance) {
            child3 = childInstance;
            return child3.send(3, {from: accounts[3]});
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "ethReceived", "The Log-Event should be ethReceived");
            // accounts created and ETH deposit done
            return master.withdrawAccount(child1.address);
        }).then(function(txResult) {
            assert(txResult.logs[0].event, "accountWithdraw", "The Log-Event should be accountWithdraw");
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            assert(balance, masterBalance + 1, "Account 1 withdraw did not work");
            masterBalance = balance;
            return master.withdrawAccount(child2.address);
        }).then(function(txResult) {
            assert(txResult.logs[0].event, "accountWithdraw", "The Log-Event should be accountWithdraw");
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            assert(balance, masterBalance + 2, "Account 2 withdraw did not work");
            masterBalance = balance;
            return master.withdrawAccount(child3.address);
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "accountWithdraw", "The Log-Event should be accountWithdraw");
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            assert(balance, masterBalance + 3, "Account 3 withdraw did not work");
            masterBalance = balance;
            return master.withdraw();
        }).then(function (txResult) {
            assert(txResult.logs[0].event, "masterWithdraw", "The Log-Event should be masterWithdraw");
            return web3.eth.getBalance(accounts[0]);
        }).then(function (balance) {
            assert(balance, accountBalance + 6);
            return web3.eth.getBalance(master.address);
        }).then(function (balance) {
            assert(balance, 0, "master balance should be equal to 0");
        })
    })

})
