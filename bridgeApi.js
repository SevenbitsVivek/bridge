const { ethers, utils } = require("ethers");
const NftBridgeEth = require('./artifacts/contracts/NftBridgeEth.sol/NftBridgeEth.json');
const NftBridgeBsc = require('./artifacts/contracts/NftBridgeBsc.sol/NftBridgeBsc.json');
const NftBridgePolygon = require('./artifacts/contracts/NftBridgePolygon.sol/NftBridgePolygon.json');

const bridgeApi = async () => {
    try {
        const ethProvider = new ethers.providers.WebSocketProvider('wss://goerli.infura.io/ws/v3/6ce920f452c84ea1b3379b187e05ade6');
        const bscProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-2-s3.binance.org:8545/');
        const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78');
        // const localhostProvider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:8545');

        const privateKey1 = "c244b6e8ae351e71fa353515c55a4e0be82fb5bf7186c18419f89421805f74b7";
        const privateKey2 = "de3498d1ef1ee0f3afd9ce6868f9912e52bbac7c8cf6bc43e169bbb80a70bc86";

        const wallet1 = new ethers.Wallet(privateKey1, ethProvider);
        const wallet2 = new ethers.Wallet(privateKey1, bscProvider);
        const wallet3 = new ethers.Wallet(privateKey2, polygonProvider);
        // const wallet3 = new ethers.Wallet("0x0aed729fd357dc5fc2e5823f8a9a280204f3e1fbdf7ed3947e281aaef0e45457", polygonProvider);

        const NftBridgeEthContractAddress = "0x03235Bd3859D758B11549977A9D81771311a8f08";
        const NftBridgeBscContractAddress = "0xa153DE1FFeAfef5ADe758d0e268247da9BDFb697";
        const NftBridgePolygonContractAddress = "0x8c9325064D374cFED65088c010270e9EA7C3eA73";

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

        nftBridgeEth.on("LockedNft", (from, to, uri, tokenId, value, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                to: to,
                uri: uri,
                tokenId: tokenId.toString(),
                value: value.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 0 && destinationChain == 1) {
                nftBridgeBsc.transferNft(from, uri, { gasLimit: 1000000 });
            } else if (sourceChain == 0 && destinationChain == 2) {
                nftBridgePolygon.transferNft(from, uri, { gasLimit: 1000000 });
            }
        })

        nftBridgeBsc.on("LockedNft", (from, to, uri, tokenId, value, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                to: to,
                uri: uri,
                tokenId: tokenId.toString(),
                value: value.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 1 && destinationChain == 0) {
                nftBridgeEth.transferNft(from, uri, { gasLimit: 1000000 });
            } else if (sourceChain == 1 && destinationChain == 2) {
                nftBridgePolygon.transferNft(from, uri, { gasLimit: 1000000 });
            }
        })

        nftBridgePolygon.on("LockedNft", (from, to, uri, tokenId, value, sourceChain, destinationChain, event) => {
            let NftTransferedEvent = {
                from: from,
                to: to,
                uri: uri,
                tokenId: tokenId.toString(),
                value: value.toString(),
                sourceChain: sourceChain,
                destinationChain: destinationChain,
                data: event,
                timestamp: Date.now()
            }
            console.log(JSON.stringify(NftTransferedEvent, null, 5))
            if (sourceChain == 2 && destinationChain == 0) {
                nftBridgeEth.transferNft(from, uri, { gasLimit: 1000000 });
            } else if (sourceChain == 2 && destinationChain == 1) {
                nftBridgeBsc.transferNft(from, uri, { gasLimit: 1000000 });
            }
        })
    } catch (error) {
        console.log(error)
    }
}
bridgeApi()

//Converting from ether to wei or from wei to ether
// console.log((utils.parseUnits("1000", 'wei')).toString())
