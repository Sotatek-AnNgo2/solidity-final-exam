import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { readData, saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, ...rest } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = readData()

  const wyvernExchangeWithBulkCancellations = await deploy("WyvernExchangeWithBulkCancellations", {
    from: deployer,
    log: true,
    args: [deployed.wyvernProxyRegistry, deployed.wyvernTokenTransferProxy, deployed.standardToken, deployed.wyvernDAOProxy]
  });

  saveData({
    wyvernExchangeWithBulkCancellations: wyvernExchangeWithBulkCancellations.address
  })
};
export default func;
func.id = "wyvernExchangeWithBulkCancellations"; // id required to prevent reexecution
func.tags = ["wyvernExchangeWithBulkCancellations"];
func.dependencies = ["standardToken", "wyvernDAOProxy", "wyvernProxyRegistry", "wyvernTokenTransferProxy"];