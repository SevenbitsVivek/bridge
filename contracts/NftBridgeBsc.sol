// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NftBridgeBsc is Ownable, ReentrancyGuard, ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 smartContractFees = 1000;

    enum SourceChain{ ETH, BSC, POLYGON }
    enum DestinationChain{ ETH, BSC, POLYGON }

    event NftTransferedToDestinationChain(address _to, string _uri);
    event LockedNft(address _from, address _to, string _uri, uint256 _tokenId, uint256 _value, SourceChain _sourceChain, DestinationChain _destinationChain);

    mapping(bytes => bool) private signatureUsed;

    constructor() ERC721("NftBridgeBsc", "NBBSC") {}

    function lockNft(
        SourceChain sourceChain,
        DestinationChain destinationChain,
        uint256 tokenId,
        address tokenAddress,
        bytes32 hash,
        bytes memory signature
    ) payable external nonReentrant {
        require(msg.value != 0, "Value should not be 0");
        require(msg.value == smartContractFees, "Fees should be equal");
        require(sourceChain == SourceChain.BSC && destinationChain != DestinationChain.BSC, "Invalid chain");
        require(
            recoverSigner(hash, signature) == owner(),
            "Address is not authorized"
        );
        require(!signatureUsed[signature], "Already signature used");
        ERC721 token;
        token = ERC721(tokenAddress);
        require(token.ownerOf(tokenId) == msg.sender, "Only the owner can lock the NFT");
        ERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        emit LockedNft(msg.sender, address(this), token.tokenURI(tokenId), tokenId, msg.value, sourceChain, destinationChain);
        signatureUsed[signature] = true;
    }

    function transferNft(
        address recipient,
        string memory uri
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Address cannot be 0");
        emit NftTransferedToDestinationChain(recipient, uri);
        safeMint(recipient, uri);
    }

    function safeMint(address recipient, string memory uri) internal onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function recoverSigner(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        bytes32 messageDigest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        return ECDSA.recover(messageDigest, signature);
    }

    function withdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Address cannot be zero");
        recipient.transfer(address(this).balance);
    }

    function changeSmartContractFees(uint256 newSmartContractFees) external onlyOwner returns(uint256) {
        require(smartContractFees != newSmartContractFees, "Fees is already same");
        smartContractFees = newSmartContractFees;
        return smartContractFees;
    }

    function getSmartContractFees() external view returns(uint256) {
        return smartContractFees;
    }

}