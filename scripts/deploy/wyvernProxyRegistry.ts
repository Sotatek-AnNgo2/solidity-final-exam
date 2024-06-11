import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, ...rest } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const wyvernProxyRegistry = await deploy("WyvernProxyRegistry", {
    from: deployer,
    log: true,
  });

  saveData({
    wyvernProxyRegistry: wyvernProxyRegistry.address
  })
};
export default func;
func.id = "wyvernProxyRegistry"; // id required to prevent reexecution
func.tags = ["wyvernProxyRegistry"];