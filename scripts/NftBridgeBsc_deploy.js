async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const NftBridgeBsc = await ethers.getContractFactory("NftBridgeBsc");
    const nftBridgeBsc = await NftBridgeBsc.deploy();

    console.log("NftBridgeBsc contract address:-", nftBridgeBsc.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });