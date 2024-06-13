import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const erc20Mock = await deploy("ERC20Mock", {
    from: deployer,
    log: true,
    args: [1000000]
  });

  saveData({
    erc20Mock: erc20Mock.address
  })
};
export default func;
func.id = "erc20Mock"; // id required to prevent reexecution
func.tags = ["erc20Mock"];