import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const wyvernToken = await deploy("WyvernToken", {
    from: deployer,
    log: true,
    args: [185976814178002]
  });

  saveData({
    wyvernToken: wyvernToken.address
  })
};
export default func;
func.id = "wyvernToken"; // id required to prevent reexecution
func.tags = ["wyvernToken"];