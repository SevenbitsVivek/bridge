require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');

module.exports = {
  solidity: "0.8.7",

  networks: {
    //BSC Testnet
    testnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
      chainId: 97,
      accounts: ['c244b6e8ae351e71fa353515c55a4e0be82fb5bf7186c18419f89421805f74b7']
    },
    //Goerli Testnet
    goerli: {
      url: `https://goerli.infura.io/v3/681d784bc2db408b8aa49ec6b887d47a`,
      gas: 300000000,
      accounts: ['c244b6e8ae351e71fa353515c55a4e0be82fb5bf7186c18419f89421805f74b7'],
    },
    //Polygon Testnet
    matic: {
      url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
      gas: 3000000000,
      accounts: ['de3498d1ef1ee0f3afd9ce6868f9912e52bbac7c8cf6bc43e169bbb80a70bc86']
    },
    //ganache
    localhost: {
      url: "HTTP://127.0.0.1:8545",
      gas: 300000000,
      accounts: ['0x0aed729fd357dc5fc2e5823f8a9a280204f3e1fbdf7ed3947e281aaef0e45457']
    }
  },

  etherscan: {
    // polygon apiKey
    // apiKey: "61NXGEUMZJGEXU5ZTZQN8ZGHRBC8PAVSFN"
    apiKey: {
      bscTestnet: "7FH7WAR3SHRS7UDI2YZQWVR5F1SJ3PJBI2",
      goerli: "JB7KZVSGD7Z4AGJGEYITX4WY1W5V4I5D1K",
      // mainnet: "JB7KZVSGD7Z4AGJGEYITX4WY1W5V4I5D1K"
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
      details: { yul: false },
    },
  },
};


