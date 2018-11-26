pragma solidity ^0.5.0;

import "./Ownable.sol";

contract ChildFactory  is Ownable {

    /** EVENTS **/
    event ethReceived(address from, address to, uint amount);
    event accountWithdraw(address from, address to, uint amount);

    /** METHODS **/
    function withdraw() public onlyOwner() {
        msg.sender.transfer(address(this).balance);
        emit accountWithdraw(address(this), msg.sender, address(this).balance);
    }

    function() external payable {
        emit ethReceived(msg.sender, address(this), msg.value);
    }

    function selfDestruct() public onlyOwner() {
        selfdestruct(msg.sender);
    }

}
