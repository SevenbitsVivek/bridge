const { ethers, utils } = require("ethers");
const BridgeEth = require('./artifacts/contracts/BridgeEth.sol/BridgeEth.json');
const BridgeBsc = require('./artifacts/contracts/BridgeBsc.sol/BridgeBsc.json');
const BridgePolygon = require('./artifacts/contracts/BridgePolygon.sol/BridgePolygon.json');

const bridgeApi = async () => {
    try {
        const ethProvider = new ethers.providers.WebSocketProvider('wss://goerli.infura.io/ws/v3/6ce920f452c84ea1b3379b187e05ade6');
        const bscProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-2-s3.binance.org:8545/');
        const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78');

        const privateKey = "de3498d1ef1ee0f3afd9ce6868f9912e52bbac7c8cf6bc43e169bbb80a70bc86";

        const wallet1 = new ethers.Wallet(privateKey, ethProvider);
        const wallet2 = new ethers.Wallet(privateKey, bscProvider);
        const wallet3 = new ethers.Wallet(privateKey, polygonProvider);

        const BridgeEthContractAddress = "0x1F40e79eBcd57CB9A8141eEE5e844418234e0562";
        const BridgeBscContractAddress = "0xD1505a5762BcA8bde741641B9d33866a5241E333";
        const BridgePolygonContractAddress = "0x013EE7B37b3282D8050843f4d0F0b6695b25FD0F";

        console.log("wallet1.address ===> ", wallet1.address)
        console.log("wallet2.address ===> ", wallet2.address)
        console.log("wallet3.address ===> ", wallet3.address)

        const bridgeEth = new ethers.Contract(
            BridgeEthContractAddress,
            BridgeEth.abi,
            wallet1
        );

        const bridgeBsc = new ethers.Contract(
            BridgeBscContractAddress,
            BridgeBsc.abi,
            wallet2
        );

        const bridgePolygon = new ethers.Contract(
            BridgePolygonContractAddress,
            BridgePolygon.abi,
            wallet3
        );

        bridgeEth.on("LockedEther", (from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let EtherTransferedEvent = {
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(EtherTransferedEvent, null, 5))
            if (sourceChain == 0 && destinationChain == 1 && tokensAvailableFromSourceChain == 0 && tokensAvailableFromDestinationChain == 1) {
                bridgeBsc.transferBnb(from, event.toString(), { from: wallet2.address, gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 1 && tokensAvailableFromSourceChain == 0 && tokensAvailableFromDestinationChain == 2) {
                bridgeBsc.transferToken("0x679f489adBc1Fb17eE86690bD8B5E47d047a064D", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2 && tokensAvailableFromSourceChain == 0 && tokensAvailableFromDestinationChain == 2) {
                bridgePolygon.transferToken("0x81eFce57E069EAF8D80D9558E9d073eC28476A2A", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2 && tokensAvailableFromSourceChain == 0 && tokensAvailableFromDestinationChain == 3) {
                bridgePolygon.transferMatic(from, event.toString(), { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        bridgeEth.on("LockedToken", (token, from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let TokenTransferedEvent = {
                token: token,
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(TokenTransferedEvent, null, 5))
            if (sourceChain == 0 && destinationChain == 1 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgeBsc.transferToken("0x679f489adBc1Fb17eE86690bD8B5E47d047a064D", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgePolygon.transferToken("0x81eFce57E069EAF8D80D9558E9d073eC28476A2A", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 1 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 1) {
                bridgeBsc.transferBnb(from, event.toString(), { from: wallet2.address, gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 3) {
                bridgePolygon.transferMatic(from, event.toString(), { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        bridgeBsc.on("LockedBnb", (from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let BnbTransferedEvent = {
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(BnbTransferedEvent, null, 5))
            if (sourceChain == 1 && destinationChain == 0 && tokensAvailableFromSourceChain == 1 && tokensAvailableFromDestinationChain == 0) {
                bridgeEth.transferEth(from, event.toString(), { from: wallet1.address, gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 0 && tokensAvailableFromSourceChain == 1 && tokensAvailableFromDestinationChain == 2) {
                bridgeEth.transferToken("0xbB53660D980f180A2219A37F9BdF0aDdF0d0cAc4", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2 && tokensAvailableFromSourceChain == 1 && tokensAvailableFromDestinationChain == 2) {
                bridgePolygon.transferToken("0x81eFce57E069EAF8D80D9558E9d073eC28476A2A", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2 && tokensAvailableFromSourceChain == 1 && tokensAvailableFromDestinationChain == 3) {
                bridgePolygon.transferMatic(from, event.toString(), { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        bridgeBsc.on("LockedToken", (token, from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let TokenTransferedEvent = {
                token: token,
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(TokenTransferedEvent, null, 5))
            if (sourceChain == 1 && destinationChain == 0 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgeEth.transferToken("0xbB53660D980f180A2219A37F9BdF0aDdF0d0cAc4", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgePolygon.transferToken("0x81eFce57E069EAF8D80D9558E9d073eC28476A2A", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 0 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 0) {
                bridgeEth.transferEth(from, event.toString(), { from: wallet1.address, gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 3) {
                bridgePolygon.transferMatic(from, event.toString(), { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        bridgePolygon.on("LockedMatic", (from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let MaticTransferedEvent = {
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(MaticTransferedEvent, null, 5))
            if (sourceChain == 2 && destinationChain == 0 && tokensAvailableFromSourceChain == 3 && tokensAvailableFromDestinationChain == 0) {
                bridgeEth.transferEth(from, event.toString(), { from: wallet1.address, gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 0 && tokensAvailableFromSourceChain == 3 && tokensAvailableFromDestinationChain == 2) {
                bridgeEth.transferToken("0xbB53660D980f180A2219A37F9BdF0aDdF0d0cAc4", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1 && tokensAvailableFromSourceChain == 3 && tokensAvailableFromDestinationChain == 2) {
                bridgeBsc.transferToken("0x679f489adBc1Fb17eE86690bD8B5E47d047a064D", from, 100, { gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1 && tokensAvailableFromSourceChain == 3 && tokensAvailableFromDestinationChain == 1) {
                bridgeBsc.transferBnb(from, event.toString(), { from: wallet2.address, gasLimit: 1000000 });
            }
        })

        bridgePolygon.on("LockedToken", (token, from, to, sourceChain, destinationChain, tokensAvailableFromSourceChain, tokensAvailableFromDestinationChain, event) => {
            let TokenTransferedEvent = {
                token: token,
                from: from,
                to: to,
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                tokensAvailableFromSourceChain: tokensAvailableFromSourceChain,
                tokensAvailableFromDestinationChain: tokensAvailableFromDestinationChain,
                value: event.toString(),
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(TokenTransferedEvent, null, 5))
            if (sourceChain == 2 && destinationChain == 0 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgeEth.transferToken("0xbB53660D980f180A2219A37F9BdF0aDdF0d0cAc4", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 2) {
                bridgeBsc.transferToken("0x679f489adBc1Fb17eE86690bD8B5E47d047a064D", from, event.toString(), { gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 1) {
                bridgeBsc.transferBnb(from, event.toString(), { from: wallet2.address, gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 0 && tokensAvailableFromSourceChain == 2 && tokensAvailableFromDestinationChain == 0) {
                bridgeEth.transferEth(from, event.toString(), { from: wallet1.address, gasLimit: 1000000 });
            }
        })
    } catch (error) {
        console.log(error)
    }
}
bridgeApi()

//Converting from ether to wei or from wei to ether
// console.log((utils.parseUnits("1000", 'wei')).toString())
