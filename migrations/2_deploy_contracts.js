var ChildFactory = artifacts.require('./ChildFactory.sol')
var Master = artifacts.require('./Master.sol')

module.exports = function (deployer) {
    deployer.deploy(ChildFactory)
    deployer.link(ChildFactory, Master)
    deployer.deploy(Master)
}
