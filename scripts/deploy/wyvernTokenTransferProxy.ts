import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { readData, saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, ...rest } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = readData()

  const wyvernTokenTransferProxy = await deploy("WyvernTokenTransferProxy", {
    from: deployer,
    log: true,
    args: [deployed.wyvernProxyRegistry]
  });

  saveData({
    wyvernTokenTransferProxy: wyvernTokenTransferProxy.address
  })
};
export default func;
func.id = "wyvernTokenTransferProxy"; // id required to prevent reexecution
func.tags = ["wyvernTokenTransferProxy"];
func.dependencies = ["wyvernProxyRegistry"];