// Import CSS
import '../styles/app.css';
import '../styles/bootstrap.css';

// Import libraries needed
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import 'bootstrap';

// Import master contract artifacts and turn it into usable abstractions.
import masterArtifact from '../../build/contracts/Master.json';
const Master = contract(masterArtifact);
import childArtifact from '../../build/contracts/ChildFactory.json';
const ChildFactory = contract(childArtifact);

let accounts;
let account;

const wei = 1000000000000000000;

const App = {

    start: function () {
        const self = this;
        Master.setProvider(web3.currentProvider);
        ChildFactory.setProvider(web3.currentProvider);
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert('There was an error fetching your accounts.');
                return;
            }
            if (accs.length === 0) {
                alert("Couldn't get any accounts, make sure your Ethereum client is configured correctly.");
                return;
            }
            accounts = accs
            account = accounts[0]
            self.displayAccount(account, "mainAccounts", "Main");
            self.initMasterAccount();
            self.initChildAccounts();
        });
    },

    displayAccount: function (add, divID, accountType) {
        var container = document.createElement('div');
        container.setAttribute('class', 'col-md-6');
        var div = document.createElement('div');
        div.setAttribute('class', 'card bg-light mb-4');
        var div2 = document.createElement('div');
        div2.setAttribute('class', 'card-body');
        var h3 = document.createElement('h3');
        h3.setAttribute('class', 'card-title text-primary');
        h3.innerHTML = accountType + ' Account';
        var h4 = document.createElement('h5');
        h4.innerHTML = add;
        h4.setAttribute('class', 'card-subtitle mb-2 text-muted');
        web3.eth.getBalance(add, function(err, value) {
            var p = document.createElement('p');
            p.setAttribute('id', add);
            p.setAttribute('class', 'card-text text-success');
            var balance = value.valueOf() / wei;
            p.innerHTML = 'Balance: ' + balance.toFixed(2) + ' ETH';
            div2.appendChild(h3);
            div2.appendChild(h4);
            div2.appendChild(p);
            if (accountType === "Child") {
                var withdraw = document.createElement('button');
                withdraw.setAttribute('class', 'btn btn-success');
                withdraw.setAttribute('onclick', 'App.withdrawAccount("' + add + '")');
                withdraw.innerHTML = "Withdraw";
                div2.appendChild(withdraw);
                var del = document.createElement('button');
                del.setAttribute('class', 'btn btn-danger ml-1');
                del.setAttribute('onclick', 'App.deleteAccount("' + add + '")');
                del.innerHTML = "Delete";
                div2.appendChild(del);
            } else if (accountType === "Master") {
                var create = document.createElement('button');
                create.setAttribute('class', 'btn btn-primary');
                create.setAttribute('onclick', 'App.createAccount()');
                create.innerHTML = "Create Account";
                div2.appendChild(create);
                var withdraw = document.createElement('button');
                withdraw.setAttribute('class', 'btn btn-success ml-1');
                withdraw.setAttribute('onclick', 'App.withdrawMaster()');
                withdraw.innerHTML = "Withdraw";
                div2.appendChild(withdraw);
            }
            div.appendChild(div2);
            container.appendChild(div);
            document.getElementById(divID).appendChild(container);
        })
    },

    updateBalance: function (add, balance) {
        balance = balance / wei;
        var p = document.getElementById(add);
        p.innerHTML = 'Balance: ' + balance + ' ETH';
    },

    displayEvent: function(event) {
        var div = document.createElement('div');
        div.setAttribute('class', 'alert alert-primary alert-dismissible fade show');
        div.setAttribute('role', 'alert');
        div.innerHTML = '<strong>' + event.event + '</strong>' + '<br>' + JSON.stringify(event.args);
        var button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'close');
        button.setAttribute('data-dismiss', 'alert');
        button.setAttribute('aria-label', 'Close');
        var span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = '&times;';
        button.appendChild(span);
        div.appendChild(button);
        document.getElementById("events").appendChild(div);
    },

    initMasterAccount: function () {
        var self = this;
        Master.deployed().then(function (instance) {
            self.displayAccount(instance.address, "mainAccounts", "Master");
            instance.allEvents({}, {fromBlock: 0, toBlock: 'latest'}).watch(function (error, result) {
                self.displayEvent(result);
                if (result.event == "childDeleted") {
                    var child;
                    if (child = document.getElementById(result.args['child'])) {
                        child = child.parentElement.parentElement;
                        child.remove();
                    }
                }
                self.updateMasterBalance();
            });
        });
    },

    updateMasterBalance: function () {
        var self = this;
        Master.deployed().then(function (instance) {
            web3.eth.getBalance(instance.address, function (err, value) {
                self.updateBalance(instance.address, value.valueOf());
            })
        });
    },

    initChildAccounts: function () {
        var self = this;
        var master;
        Master.deployed().then(function (instance) {
            master = instance;
            return master.getNbChildren();
        }).then(function (nbChildren) {
            for (var i=1; i<=nbChildren; i++) {
                master.getChildAddress(i).then(function (childAdd) {
                    self.displayAccount(childAdd, "childrenAccounts", "Child");
                    self.watchChildEvents(childAdd);
                });
            }
        });
    },

    watchChildEvents: function (childAdd) {
        var self = this;
        return ChildFactory.at(childAdd).then(function (instance) {
            instance.allEvents({}, {fromBlock: 0, toBlock: 'latest'}).watch(function (error, result) {
                self.displayEvent(result);
                self.updateBalance(childAdd, result.args['amount']);
            });
        });
    },

    createAccount: function () {
        const self = this;
        Master.deployed().then(function (instance) {
            return instance.createChildAccount({from: accounts[0]});
        }).then(function (txResult) {
            self.displayAccount(txResult.logs[1].args.child, "childrenAccounts", "Child");
            self.watchChildEvents(txResult.logs[1].args.child);
        })
    },

    withdrawAccount: function (add) {
        const self = this;
        Master.deployed().then(function (instance) {
            return instance.withdrawAccount(add, {from: accounts[0]});
        });
    },

    withdrawMaster: function () {
        const self = this;
        Master.deployed().then(function (instance) {
            return instance.withdraw({from: accounts[0]});
        }).then(function () {
            return web3.eth.getBalance(account, function (err, value) {
                self.updateBalance(account, value.valueOf());
            });
        });
    },

    deleteAccount: function (add) {
        const self = this;
        Master.deployed().then(function (instance) {
            return instance.deleteChildAccount(add, {from: accounts[0]});
        });
    }
}

window.App = App

window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
        } catch (error) {
            console.warn("Access to account not allowed");
        }
        console.log("Connected to provider with success");
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    App.start();
});
