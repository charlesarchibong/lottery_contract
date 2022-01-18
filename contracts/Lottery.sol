// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    constructor() {
        manager = msg.sender;
    }

    address public manager;

    address[] public players;

    address[] public winners;

    function enter() public payable {
        require(
            msg.value > .01 ether,
            "You must deposit at least 0.01eth ether"
        );
        players.push(msg.sender);
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function pickWinner() public payable {
        uint256 winner = random() % players.length;
        address winnerAddress = players[winner];
        payable(winnerAddress).transfer((address(this).balance * 60) / 100);
        payable(manager).transfer((address(this).balance * 40) / 100);
        winners.push(winnerAddress);
        players = new address[](0);
    }
}
