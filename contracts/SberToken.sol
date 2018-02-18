pragma solidity ^0.4.18;
import "./util/Token.sol";

/// @title Token contract - Implements Standard ERC20 Token for SberCoin project.
/// @author Nice Folk Out
contract SberToken is Token {
    /*
     * Token meta data
     */
    string constant public name = "SberToken";

    string constant public symbol = "SRUB";
    uint8 constant public decimals = 8;

    // Address where Foundation tokens are allocated
    address constant public foundationReserve = address(0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF);

    // Address where tokens are minted (for Etherscan)
    address constant public mintAddress = address(0x1111111111111111111111111111111111111111);

    // Address where tokens are burned (for Etherscan)
    address constant public burnAddress = address(0x0000000000000000000000000000000000000000);

    /// @dev Contract constructor
    function SberToken()
        public
    {
        // Overall, 1,000,000,000 SRUB tokens are distributed
        totalSupply = withDecimals(pow(10,9), decimals);

        // Allocate foundation tokens
        balances[foundationReserve] = totalSupply;
        allowed[foundationReserve][owner] = balanceOf(foundationReserve);

        //Add log for Etherscan
        Transfer(mintAddress, foundationReserve, balanceOf(foundationReserve));
        Issuance(foundationReserve, balanceOf(foundationReserve));
    }

    /// @dev Mint new tokens to foundationReserve
    function mint(uint256 amount)
      public
      onlyOwner
    {
        // Calculate amount of tokens needed to be minted with decimals
        uint256 mintedSupply = withDecimals(amount, decimals);

        //Calculate new total supply
        totalSupply = add(totalSupply, mintedSupply);

        //Increase balance of foundationReserve
        balances[foundationReserve] = add(balanceOf(foundationReserve), mintedSupply);
        allowed[foundationReserve][owner] = balanceOf(foundationReserve);

        //Add log for Etherscan
        Transfer(mintAddress, foundationReserve, mintedSupply);
        Issuance(foundationReserve, mintedSupply);
    }

    /// @dev Burn tokens from foundationReserve
    function burn(uint256 amount)
      public
      onlyOwner
    {
      // Calculate amount of tokens needed to be minted with decimals
      uint256 burnedSupply = withDecimals(amount, decimals);

      // Check if foundationReserve has enough tokens
      require(burnedSupply <= balanceOf(foundationReserve));

      //Calculate new total supply
      totalSupply = sub(totalSupply, burnedSupply);

      //Decrease balance of foundationReserve
      balances[foundationReserve] = sub(balanceOf(foundationReserve), burnedSupply);
      allowed[foundationReserve][owner] = balanceOf(foundationReserve);

      //Add log for Etherscan
      Transfer(foundationReserve, burnAddress, burnedSupply);
    }

    function confirmOwnership()
        public
        onlyPotentialOwner
    {
        // Forbid old owner to withdraw tokens from the Foundation reserve allocation
        allowed[foundationReserve][owner] = 0;

        // Allow new owner to withdraw tokens from the Foundation reserve
        allowed[foundationReserve][msg.sender] = balanceOf(foundationReserve);

        super.confirmOwnership();
    }


    /// @dev Withdraws tokens from Foundation reserve
    function withdrawFromReserve(address _to, uint256 amount)
        public
        onlyOwner
    {
        require(transferFrom(foundationReserve, _to, withDecimals(amount, decimals)));
    }
}
