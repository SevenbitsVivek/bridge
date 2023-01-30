async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const BridgeEth = await ethers.getContractFactory("BridgeEth");
    const bridgeEth = await BridgeEth.deploy();

    console.log("BridgeEth contract address:-", bridgeEth.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });