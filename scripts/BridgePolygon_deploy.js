async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const BridgePolygon = await ethers.getContractFactory("BridgePolygon");
    const bridgePolygon = await BridgePolygon.deploy();

    console.log("BridgePolygon contract address:-", bridgePolygon.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });