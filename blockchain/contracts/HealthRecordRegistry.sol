// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title HealthRecordRegistry — CuraSync on-chain audit anchor
/// @notice Stores keccak256 hashes of off-chain medical records + IPFS CIDs.
///         Used as tamper-evidence layer; full record stays in Supabase + IPFS.
contract HealthRecordRegistry {
    struct RecordEntry {
        bytes32 contentHash;
        address registeredBy;
        uint256 timestamp;
        string ipfsCid;
    }

    mapping(string => RecordEntry[]) private records;

    event RecordRegistered(
        string indexed recordId,
        bytes32 contentHash,
        string ipfsCid,
        uint256 timestamp,
        address registeredBy
    );

    function registerRecord(
        string calldata recordId,
        bytes32 contentHash,
        string calldata ipfsCid
    ) external {
        require(bytes(recordId).length > 0, "recordId empty");
        require(contentHash != bytes32(0), "contentHash empty");

        records[recordId].push(
            RecordEntry(contentHash, msg.sender, block.timestamp, ipfsCid)
        );

        emit RecordRegistered(
            recordId,
            contentHash,
            ipfsCid,
            block.timestamp,
            msg.sender
        );
    }

    function verifyRecord(string calldata recordId, bytes32 contentHash)
        external
        view
        returns (bool)
    {
        RecordEntry[] memory entries = records[recordId];
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].contentHash == contentHash) return true;
        }
        return false;
    }

    function getHistory(string calldata recordId)
        external
        view
        returns (RecordEntry[] memory)
    {
        return records[recordId];
    }

    function getLatest(string calldata recordId)
        external
        view
        returns (RecordEntry memory entry, bool exists)
    {
        RecordEntry[] memory entries = records[recordId];
        if (entries.length == 0) {
            return (entry, false);
        }
        return (entries[entries.length - 1], true);
    }

    function getVersionCount(string calldata recordId)
        external
        view
        returns (uint256)
    {
        return records[recordId].length;
    }
}
