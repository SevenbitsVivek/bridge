const { ethers, utils } = require("ethers");
const NftBridgeEth = require('./artifacts/contracts/NftBridgeEth.sol/NftBridgeEth.json');
const NftBridgeBsc = require('./artifacts/contracts/NftBridgeBsc.sol/NftBridgeBsc.json');
const NftBridgePolygon = require('./artifacts/contracts/NftBridgePolygon.sol/NftBridgePolygon.json');

const bridgeApi = async () => {
    try {
        const ethProvider = new ethers.providers.WebSocketProvider('wss://goerli.infura.io/ws/v3/6ce920f452c84ea1b3379b187e05ade6');
        const bscProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-2-s3.binance.org:8545/');
        // const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78');
        const polygonProvider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:8545');

        const privateKey = "c244b6e8ae351e71fa353515c55a4e0be82fb5bf7186c18419f89421805f74b7";

        const wallet1 = new ethers.Wallet(privateKey, ethProvider);
        const wallet2 = new ethers.Wallet(privateKey, bscProvider);
        // const wallet3 = new ethers.Wallet(privateKey, polygonProvider);
        const wallet3 = new ethers.Wallet("0x0aed729fd357dc5fc2e5823f8a9a280204f3e1fbdf7ed3947e281aaef0e45457", polygonProvider);

        const NftBridgeEthContractAddress = "0xACb4611ba10ED2CE99C9Fe59Dd1144b06A43d19e";
        const NftBridgeBscContractAddress = "0x54a05B7d5D341A74EE3d3Ada3f89089b849E3c3d";
        // const NftBridgePolygonContractAddress = "0x5218C6D3e94156dC2e9986e328e785D3C3686AC5";
        const NftBridgePolygonContractAddress = "0xE7f1BEfeafD7FcD6f2478BdaBEbE1429aAfC6905";

        console.log("wallet1.address ===> ", wallet1.address)
        console.log("wallet2.address ===> ", wallet2.address)
        console.log("wallet3.address ===> ", wallet3.address)

        const nftBridgeEth = new ethers.Contract(
            NftBridgeEthContractAddress,
            NftBridgeEth.abi,
            wallet1
        );

        const nftBridgeBsc = new ethers.Contract(
            NftBridgeBscContractAddress,
            NftBridgeBsc.abi,
            wallet2
        );

        const nftBridgePolygon = new ethers.Contract(
            NftBridgePolygonContractAddress,
            NftBridgePolygon.abi,
            wallet3
        );

        nftBridgeEth.on("LockedNft", (from, uri, tokenId, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                uri: uri,
                tokenId: tokenId.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 0 && destinationChain == 1) {
                nftBridgeBsc.transferNft(from, uri, tokenId, { from: wallet2.address, gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2) {
                nftBridgePolygon.transferNft(from, uri, tokenId, { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        nftBridgeBsc.on("LockedNft", (from, uri, tokenId, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                uri: uri,
                tokenId: tokenId.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 1 && destinationChain == 0) {
                nftBridgeEth.transferNft(from, uri, tokenId, { from: wallet1.address, gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2) {
                nftBridgePolygon.transferNft(from, uri, tokenId, { from: wallet3.address, gasLimit: 1000000 });
            }
        })

        nftBridgePolygon.on("LockedNft", (from, uri, tokenId, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                uri: uri,
                tokenId: tokenId.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 2 && destinationChain == 0) {
                nftBridgeEth.transferNft(from, uri, tokenId, { from: wallet1.address, gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1) {
                nftBridgeBsc.transferNft(from, uri, tokenId, { from: wallet2.address, gasLimit: 1000000 });
            }
        })
    } catch (error) {
        console.log(error)
    }
}
bridgeApi()

//Converting from ether to wei or from wei to ether
// console.log((utils.parseUnits("1000", 'wei')).toString())
