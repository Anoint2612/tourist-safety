// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    event UserRecorded(bytes32 indexed userHash, address indexed recorder, uint256 timestamp);
    mapping(bytes32 => uint256) public recordedAt;

    function recordUser(bytes32 userHash) external {
        require(userHash != bytes32(0), "invalid hash");
        if (recordedAt[userHash] == 0) {
            recordedAt[userHash] = block.timestamp;
            emit UserRecorded(userHash, msg.sender, block.timestamp);
        }
    }
}
