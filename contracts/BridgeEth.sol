// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BridgeEth is Ownable, Pausable, ReentrancyGuard {
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
    event EtherTransferedToDestinationChain(address _from, address _to, uint256 indexed _value);
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
    event LockedEther(address _from, address _to,  SourceChain _sourceChain, DestinationChain _destinationChain, SourceChainTokensAvailable _tokensAvailableFromSourceChain, DestinationChainTokensAvailable _tokensAvailableFromDestinationChain, uint256 indexed _value);

    mapping(bytes => bool) private signatureUsed;

    function lockEther(
        SourceChain sourceChain,
        DestinationChain destinationChain,
        SourceChainTokensAvailable tokensAvailableFromSourceChain,
        DestinationChainTokensAvailable tokensAvailableFromDestinationChain,
        uint256 value,
        bytes32 hash,
        bytes memory signature
    ) external payable whenNotPaused nonReentrant {
        require(msg.value != 0, "Insufficient amount");
        require(sourceChain == SourceChain.ETH && destinationChain != DestinationChain.ETH, "Invalid chain");
        require(tokensAvailableFromSourceChain != SourceChainTokensAvailable.TOKEN && tokensAvailableFromSourceChain != SourceChainTokensAvailable.BNB && tokensAvailableFromDestinationChain != DestinationChainTokensAvailable.ETH, "Invalid token");
        require(msg.value == value, "Value should be match");
        require(
            recoverSigner(hash, signature) == owner(),
            "Address is not authorized"
        );
        require(!signatureUsed[signature], "Already signature used");
        emit LockedEther(msg.sender, address(this), sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, value);
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
    ) external whenNotPaused nonReentrant {
        require(amount != 0, "Insufficient amount");
        require(sourceChain == SourceChain.ETH && destinationChain != DestinationChain.ETH, "Invalid chain");
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

    function transferEth(
        address recipient,
        uint256 value
    ) external onlyOwner whenNotPaused nonReentrant {
        require(recipient != address(0), "Address cannot be 0");
        uint256 smartContractFeesForEth = (value * smartContractFees) / 100;
        emit EtherTransferedToDestinationChain(address(this), recipient, value - smartContractFeesForEth);
        payable(recipient).transfer(value - smartContractFeesForEth);
    }

    function transferToken(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external onlyOwner whenNotPaused nonReentrant {
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

    function lockEthToContract(
        uint256 value
    ) external payable onlyOwner whenNotPaused nonReentrant {
        require(msg.value != 0, "Insufficient amount");
        require(msg.value == value, "Value should be match");
    }

    function lockTokenToContract(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner whenNotPaused nonReentrant {
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

    function transferTokenBackToUser(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(amount != 0, "Insufficient amount");
        require(tokenAddress != address(0), "Address cannot be zero");
        IERC20 token;
        token = IERC20(tokenAddress);
        SafeERC20.safeTransfer(
            token,
            recipient,
            amount
        );
    }

    function transferEthBackToUser(
        address recipient,
        uint256 value
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Address cannot be zero");
        require(value != 0, "Insufficient amount");
        payable(recipient).transfer(value);
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant{
        require(recipient != address(0), "Address cannot be zero");
        recipient.transfer(address(this).balance);
    }

    function withdrawToken(address tokenAddress, address recipient)
        external
        onlyOwner
        nonReentrant
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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
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