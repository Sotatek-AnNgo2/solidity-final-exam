pragma solidity 0.4.26;

import { DelayedReleaseToken } from "./token/DelayedReleaseToken.sol";
import { BurnableToken } from "./token/BurnableToken.sol";

// thiếu contract UTXORedeemableToken? không, compile bị lỗi nên buộc phải bỏ
contract WyvernToken is DelayedReleaseToken, BurnableToken {

    uint constant public decimals     = 18;
    string constant public name       = "Project Wyvern Token";
    string constant public symbol     = "WYV";

    /* Amount of tokens per Wyvern. */
    uint constant public MULTIPLIER       = 1;

    /* Constant for conversion from satoshis to tokens. */
    uint constant public SATS_TO_TOKENS   = MULTIPLIER * (10 ** decimals) / (10 ** 8);

    /* Total mint amount, in tokens (will be reached when all UTXOs are redeemed). */
    uint constant public MINT_AMOUNT      = 2000000 * MULTIPLIER * (10 ** decimals);

    /**
      * @dev Initialize the Wyvern token
      * @param totalUtxoAmount Total satoshis of the UTXO set
      */
    constructor(uint totalUtxoAmount) public {
        /* Total number of tokens that can be redeemed from UTXOs. */
        uint utxoTokens = SATS_TO_TOKENS * totalUtxoAmount;

        /* Configure DelayedReleaseToken. */
        temporaryAdmin = msg.sender;
        numberOfDelayedTokens = MINT_AMOUNT - utxoTokens;

        /* Configure UTXORedeemableToken. */
        totalSupply = MINT_AMOUNT;
    }

}