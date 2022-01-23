const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config()

const devProvider = new HDWalletProvider(
  process.env.MNEMONIC_KEY,
  process.env.INFURA_URL
);

module.exports = {
  networks: {
    development: {
      provider: function () { return devProvider; },
      network_id: "*", // Match any network id
    },
    advanced: {
      websockets: true, // Enable EventEmitter interface for web3 (default: false)
    },
  },
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      version: "^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};