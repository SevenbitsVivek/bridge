// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract NftBridgeBsc is Ownable, ReentrancyGuard, ERC721, ERC721URIStorage {

    enum SourceChain{ ETH, BSC, POLYGON }
    enum DestinationChain{ ETH, BSC, POLYGON }

    event NftTransferedToDestinationChain(address _to, uint256 indexed _tokenId, string _uri);
    event LockedNft(address _from, address _to, string _uri, uint256 _tokenId, SourceChain _sourceChain, DestinationChain _destinationChain);

    mapping(bytes => bool) private signatureUsed;

    constructor() ERC721("NftBridgeBSC", "NBBSC") {}

    function lockNft(
        SourceChain sourceChain,
        DestinationChain destinationChain,
        uint256 tokenId,
        address tokenAddress,
        bytes32 hash,
        bytes memory signature
    ) external nonReentrant {
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
        emit LockedNft(msg.sender, address(this), token.tokenURI(tokenId), tokenId, sourceChain, destinationChain);
        signatureUsed[signature] = true;
    }

    function transferNft(
        address recipient,
        string memory uri,
        uint256 tokenId
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Address cannot be 0");
        require(!_exists(tokenId), "Nft already exists");
        emit NftTransferedToDestinationChain(recipient, tokenId, uri);
        safeMint(recipient, tokenId, uri);
    }

    function safeMint(address to, uint256 tokenId, string memory uri)
        internal
    {
        _safeMint(to, tokenId);
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
}