import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-log-remover";
import { config } from "dotenv";
config();

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.4.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.26",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  contractSizer: {},
  namedAccounts: {
    deployer: {
      default: 0,
    },
    seller: {
      default: 0,
    },
    buyer: {
      default: 0,
    },
  },
  networks: {
    sepolia: {
      chainId: 11155111,
      url: "https://eth-sepolia.api.onfinality.io/public",
      accounts: [
        `9e38521f2352331888f44bcee1103d680f2833bc143bcb8c1e86bb71e66f33ba`,
      ],
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      sepolia: 'YNT1GHTV5DXIF7QU63WTNURWPKW1Y99XE7'
    }
  },
  paths: {
    deploy: 'scripts/deploy'
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
  },
  gasReporter: {
    currency: 'USD',
    enabled: true,
    // coinmarketcap: "abc123...",
  }
};

export default hardhatConfig;
