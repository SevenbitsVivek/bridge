
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Token = await ethers.getContractFactory("token");
    const token = await Token.deploy("test", "T", 1000000000);

    console.log("Token contract address:-", token.address);

    // const BridgeBsc = await ethers.getContractFactory("BridgeBsc");
    // const bridgeBsc = await BridgeBsc.deploy();

    // console.log("BridgeBsc contract address:-", bridgeBsc.address);

    // await token.transfer(bridgeBsc.address, 1000000000, { from: deployer.address})

    const tokenBalance = await token.balanceOf(deployer.address);
    console.log(tokenBalance.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });