async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const BridgeBsc = await ethers.getContractFactory("BridgeBsc");
    const bridgeBsc = await BridgeBsc.deploy();

    console.log("BridgeBsc contract address:-", bridgeBsc.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });