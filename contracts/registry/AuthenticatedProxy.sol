/* 

  Proxy contract to hold access to assets on behalf of a user (e.g. ERC20 approve) and execute calls under particular conditions.

*/

pragma solidity ^0.4.13;

import "hardhat/console.sol";
import { ProxyRegistry } from "./ProxyRegistry.sol";
import { TokenRecipient } from "../libraries/TokenRecipient.sol";
import { OwnedUpgradeabilityStorage } from "./proxy/OwnedUpgradeabilityStorage.sol";

/**
 * @title AuthenticatedProxy
 * @author Project Wyvern Developers
 */
contract AuthenticatedProxy is TokenRecipient, OwnedUpgradeabilityStorage {

    /* Whether initialized. */
    bool initialized = false;

    /* Address which owns this proxy. */
    address public user;

    /* Associated registry with contract authentication information. */
    ProxyRegistry public registry;

    /* Whether access has been revoked. */
    bool public revoked;

    /* Delegate call could be used to atomically transfer multiple assets owned by the proxy contract with one order. */
    enum HowToCall { Call, DelegateCall }

    /* Event fired when the proxy access is revoked or unrevoked. */
    event Revoked(bool revoked);

    /**
     * Initialize an AuthenticatedProxy
     *
     * @param addrUser Address of user on whose behalf this proxy will act
     * @param addrRegistry Address of ProxyRegistry contract which will manage this proxy
     */
    function initialize (address addrUser, ProxyRegistry addrRegistry)
        public
    {
        require(!initialized);
        initialized = true;
        user = addrUser;
        registry = addrRegistry;
    }

    /**
     * Set the revoked flag (allows a user to revoke ProxyRegistry access)
     *
     * @dev Can be called by the user only
     * @param revoke Whether or not to revoke access
     */
    function setRevoke(bool revoke)
        public
    {
        require(msg.sender == user);
        revoked = revoke;
        emit Revoked(revoke);
    }

    /**
     * Execute a message call from the proxy contract
     *
     * @dev Can be called by the user, or by a contract authorized by the registry as long as the user has not revoked access
     * @param dest Address to which the call will be sent
     * @param howToCall Which kind of call to make
     * @param calldata Calldata to send
     * @return Result of the call (success or failure)
     */
    function proxy(address dest, HowToCall howToCall, bytes calldata)
        public
        returns (bool result)
    {
        console.log("20");
        console.log("user %s", user);
        console.log("msg.sender %s", msg.sender);
        console.log("revoked %s", revoked);
        console.log("registry.contracts(msg.sender) %s", registry.contracts(msg.sender));
        require(msg.sender == user || (!revoked && registry.contracts(msg.sender)));
        console.log("21");

        if (howToCall == HowToCall.Call) {
        console.log("22");
        console.log("dest %s", dest);
        console.logAddress(address(this));
        console.logBytes(calldata);
            result = dest.call(calldata);
        } else if (howToCall == HowToCall.DelegateCall) {
        console.log("23");
            result = dest.delegatecall(calldata);
        }
        console.log("result %s", result);
        return result;
    }

    /**
     * Execute a message call and assert success
     * 
     * @dev Same functionality as `proxy`, just asserts the return value
     * @param dest Address to which the call will be sent
     * @param howToCall What kind of call to make
     * @param calldata Calldata to send
     */
    function proxyAssert(address dest, HowToCall howToCall, bytes calldata)
        public
    {
        require(proxy(dest, howToCall, calldata));
    }

}
