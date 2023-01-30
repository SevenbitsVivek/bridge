async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const NftBridgeEth = await ethers.getContractFactory("NftBridgeEth");
    const nftBridgeEth = await NftBridgeEth.deploy();

    console.log("NftBridgeEth contract address:-", nftBridgeEth.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });