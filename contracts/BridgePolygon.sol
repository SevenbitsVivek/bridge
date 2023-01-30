// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BridgePolygon is Ownable, ReentrancyGuard {
    uint256 contractBalance;
    uint256 smartContractFees = 2;

    enum SourceChain{ ETH, BSC, POLYGON }
    enum DestinationChain{ ETH, BSC, POLYGON }
    enum SourceChainTokensAvailable{ ETH, BNB, TOKEN, MATIC }
    enum DestinationChainTokensAvailable{ ETH, BNB, TOKEN, MATIC }

    event TokenTransferedToDestinationChain(
        address _token,
        address _from,
        address _to,
        uint256 indexed _amount
    );
    event MaticTransferedToDestinationChain(address _from, address _to, uint256 indexed _value);
    event LockedToken(
        address _token,
        address _from,
        address _to,
        SourceChain _sourceChain,
        DestinationChain _destinationChain,
        SourceChainTokensAvailable _tokensAvailableFromSourceChain,
        DestinationChainTokensAvailable _tokensAvailableFromDestinationChain,
        uint256 indexed _amount
    );
    event LockedMatic(address _from, address _to,  SourceChain _sourceChain, DestinationChain _destinationChain, SourceChainTokensAvailable _tokensAvailableFromSourceChain, DestinationChainTokensAvailable _tokensAvailableFromDestinationChain, uint256 indexed _value);

    mapping(bytes => bool) private signatureUsed;

    function lockMatic(
        SourceChain sourceChain,
        DestinationChain destinationChain,
        SourceChainTokensAvailable tokensAvailableFromSourceChain,
        DestinationChainTokensAvailable tokensAvailableFromDestinationChain,
        uint256 value,
        bytes32 hash,
        bytes memory signature
    ) external payable nonReentrant {
        require(msg.value != 0, "Insufficient amount");
        require(sourceChain == SourceChain.POLYGON && destinationChain != DestinationChain.POLYGON, "Invalid chain");
        require(tokensAvailableFromSourceChain != SourceChainTokensAvailable.TOKEN && tokensAvailableFromSourceChain != SourceChainTokensAvailable.BNB && tokensAvailableFromDestinationChain != DestinationChainTokensAvailable.ETH, "Invalid token");
        require(msg.value == value, "Value should be match");
        require(
            recoverSigner(hash, signature) == owner(),
            "Address is not authorized"
        );
        require(!signatureUsed[signature], "Already signature used");
        emit LockedMatic(msg.sender, address(this), sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, value);
        signatureUsed[signature] = true;
    }

    function lockToken(
        SourceChain sourceChain,
        DestinationChain destinationChain,
        SourceChainTokensAvailable tokensAvailableFromSourceChain,
        DestinationChainTokensAvailable tokensAvailableFromDestinationChain,
        address tokenAddress,
        uint256 amount,
        bytes32 hash,
        bytes memory signature
    ) external {
        require(amount != 0, "Insufficient amount");
        require(sourceChain == SourceChain.POLYGON && destinationChain != DestinationChain.POLYGON, "Invalid chain");
        require(tokensAvailableFromSourceChain != SourceChainTokensAvailable.ETH && tokensAvailableFromSourceChain != SourceChainTokensAvailable.BNB && tokensAvailableFromDestinationChain != DestinationChainTokensAvailable.ETH, "Invalid token");
        require(tokenAddress != address(0), "Address cannot be zero");
        require(
            recoverSigner(hash, signature) == owner(),
            "Address is not authorized"
        );
        require(!signatureUsed[signature], "Already signature used");
        IERC20 token;
        token = IERC20(tokenAddress);
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Check the token allowance"
        );
        emit LockedToken(
            tokenAddress,
            msg.sender,
            address(this),
            sourceChain,
            destinationChain,
            tokensAvailableFromSourceChain,
            tokensAvailableFromDestinationChain,
            amount
        );
        SafeERC20.safeTransferFrom(
            token,
            msg.sender,
            address(this),
            amount
        );
        signatureUsed[signature] = true;
    }

    function transferMatic(
        address recipient,
        uint256 value
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Address cannot be 0");
        uint256 smartContractFeesForEth = (value * smartContractFees) / 100;
        emit MaticTransferedToDestinationChain(address(this), recipient, value - smartContractFeesForEth);
        payable(recipient).transfer(value - smartContractFeesForEth);
    }

    function transferToken(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        IERC20 token;
        token = IERC20(tokenAddress);
        require(tokenAddress != address(0), "Address cannot be zero");
        require(recipient != address(0), "Address cannot be 0");
        require(amount != 0, "Insufficient amount");
        uint smartContractFeesForToken = (amount * smartContractFees) / 100;
        emit TokenTransferedToDestinationChain(tokenAddress, address(this), recipient, amount - smartContractFeesForToken);
        token.transfer(
            recipient,
            amount - smartContractFeesForToken
        );
    }

    function lockMaticToContract(
        uint256 value
    ) external payable onlyOwner nonReentrant {
        require(msg.value != 0, "Insufficient amount");
        require(msg.value == value, "Value should be match");
    }

    function lockTokenToContract(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner{
        IERC20 token;
        token = IERC20(tokenAddress);
        require(tokenAddress != address(0), "Address cannot be zero");
        require(amount != 0, "Insufficient amount");
        token.transferFrom(
            msg.sender,
            address(this),
            amount
        );
    }

    function withdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Address cannot be zero");
        recipient.transfer(address(this).balance);
    }

    function withdrawToken(address tokenAddress, address recipient)
        external
        onlyOwner
    {
        require(recipient != address(0), "Address cannot be zero");
        IERC20 token;
        token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) > 0, "Insufficient balance");
        SafeERC20.safeTransfer(
            token,
            recipient,
            token.balanceOf(address(this))
        );
    }

    function changeSmartContractFees(uint256 newSmartContractFees) external onlyOwner returns(uint256) {
        require(smartContractFees != newSmartContractFees, "Same fees allocated");
        return smartContractFees = newSmartContractFees;
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

    function getTokenBalance(address tokenAddress, address recipient)
        external
        onlyOwner
        view
        returns (uint256)
    {
        require(tokenAddress != address(0), "Address cannot be zero");
        require(recipient != address(0), "Address cannot be zero");
        IERC20 token;
        token = IERC20(tokenAddress);
        return token.balanceOf(recipient);
    }

    function getSmartContractFees() external view returns(uint256) {
        return smartContractFees;
    }
}