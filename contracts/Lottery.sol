pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    //constructor for getting the manager of the lottery
    function Lottery() {
        manager = msg.sender;
    }

    //a function is payable whenever somebody might send some ether along
    function enter() public payable { 
        //require is a global function same as 'msg' function
        //it is used for validation
        //we can pass a boolean expression to it 
        //if expression is evaluated to false, function is immidiately existed and no changes are made to the contract
        //if the expression is evaluated to true, function is executed properly
        require(msg.value > 0.01 ether);
        players.push(msg.sender);

        //NOTE: all the ether received from the players is contained in this contract
    }

    //private because we do not want anyone to call or access this function
    //view as this function does not change anything in the contract
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted {
        //this number generates the index of the winner from the array
        uint index = random() % players.length;

        //to transfer all the ether contained in this contract to the winner
        players[index].transfer(this.balance);

        //resetting the players
        players = new address[](0);
    }

    //FUNCTION MODIFIERS
    //to avoid repeating code
    modifier restricted() {
        //to ensure that only the manager can call this function
        require(msg.sender == manager);
        _;
    }

    function returnPlayers() public view returns(address[]) {
        return players;
    }

    function spitBalance() public view returns(uint) {
        return this.balance;
    }
}