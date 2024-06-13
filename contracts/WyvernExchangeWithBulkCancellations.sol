pragma solidity 0.4.26;

import { Exchange } from "./exchange/Exchange.sol";
import { ProxyRegistry } from "./registry/ProxyRegistry.sol";
import { TokenTransferProxy } from "./registry/TokenTransferProxy.sol";
import { ERC20 } from "./libraries/ERC20.sol";

contract WyvernExchangeWithBulkCancellations is Exchange {
    string public constant codename = "Bulk Smash";

    /**
     * @dev Initialize a WyvernExchange instance
     * @param registryAddress Address of the registry instance which this Exchange instance will use
     * @param tokenAddress Address of the token used for protocol fees
     */
    constructor (ProxyRegistry registryAddress, TokenTransferProxy tokenTransferProxyAddress, ERC20 tokenAddress, address protocolFeeAddress) public {
        registry = registryAddress;
        tokenTransferProxy = tokenTransferProxyAddress;
        exchangeToken = tokenAddress;
        protocolFeeRecipient = protocolFeeAddress;
        owner = msg.sender;
    }
}
