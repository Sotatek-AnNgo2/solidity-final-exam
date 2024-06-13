pragma solidity ^0.4.13;

import { DelegateProxy } from "./dao/DelegateProxy.sol";

contract WyvernDAOProxy is DelegateProxy {

    constructor()
        public
    {
        owner = msg.sender;
    }

}