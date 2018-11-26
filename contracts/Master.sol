pragma solidity ^0.5.0;

import "./Ownable.sol";
import "./ChildFactory.sol";

contract Master is Ownable {

    /** STORAGE **/
    mapping(address => uint) private childrenIndex;
    address payable[] private childrenAccounts;

    /** EVENTS **/
    event childCreated(address child);
    event childDeleted(address child);
    event masterETHReceived(address from, address to, uint amount);
    event masterWithdraw(address from, address to, uint amount);

    /** METHODS **/
    constructor() public {
        // To start the array at index 1
        childrenAccounts.push(address(0));
    }

    /** GET METHODS **/
    function getNbChildren() external view returns(uint) {
        return childrenAccounts.length - 1;
    }

    function getChildAddress(uint index) external view returns (address payable) {
        return childrenAccounts[index];
    }

    function getChildIndex(address payable childAdd) external view returns (uint) {
        return childrenIndex[childAdd];
    }

    /** CREATE/DELETE CHILDREN ACCOUNTS **/
    function createChildAccount() public onlyOwner() {
        require(childrenAccounts.length + 1 > childrenAccounts.length);
        ChildFactory child = new ChildFactory();
        childrenAccounts.push(address(child));
        childrenIndex[address(child)] = childrenAccounts.length - 1;
        emit childCreated(address(child));
    }

    function deleteChildAccount(address payable deleteAdd) public onlyOwner() {
        require(childrenIndex[deleteAdd] > 0);
        require(childrenAccounts.length > 1);

        // replace the child to delete with the last child of the array
        address payable lastChild = childrenAccounts[childrenAccounts.length - 1];
        if (lastChild != deleteAdd) {
            uint deleteIndex = childrenIndex[deleteAdd];
            childrenAccounts[deleteIndex] = lastChild;
            childrenIndex[lastChild] = deleteIndex;
        }
        childrenAccounts.length--;
        childrenIndex[deleteAdd] = 0;

        ChildFactory child = ChildFactory(deleteAdd);
        child.withdraw();
        child.selfDestruct();
        emit childDeleted(deleteAdd);
    }

    /** WITHDRAW CHILDREN ACCOUNTS **/
    function withdrawAccount(address payable childAdd) public onlyOwner() {
        require(childrenIndex[childAdd] > 0);
        ChildFactory child = ChildFactory(childAdd);
        child.withdraw();
    }

    function withdraw() public onlyOwner() {
        msg.sender.transfer(address(this).balance);
        emit masterWithdraw(address(this), msg.sender, address(this).balance);
    }

    /** FALLBACK FUNCTION **/
    function() external payable {
        emit masterETHReceived(msg.sender, address(this), msg.value);
    }

    /** SELFDESTRUCT **/
    function selfDestruct() public onlyOwner() {
        // No more accounts except the fake one in position 0
        require(childrenAccounts.length <= 1);
        selfdestruct(msg.sender);
    }

}
