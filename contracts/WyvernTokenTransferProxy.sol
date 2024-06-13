pragma solidity ^0.4.13;

import { TokenTransferProxy } from "./registry/TokenTransferProxy.sol";
import { ProxyRegistry } from "./registry/ProxyRegistry.sol";

contract WyvernTokenTransferProxy is TokenTransferProxy {

    constructor (ProxyRegistry registryAddr)
        public
    {
        registry = registryAddr;
    }

}
