pragma solidity ^0.4.18;
import "./util/AbstractToken.sol";
import "./util/Owned.sol";
import "./util/SafeMath.sol";

/// @title Token contract - Implements Standard ERC20 Token for SberCoin project.
/// @author Nice Folk Out
contract WealthManagement is Owned, SafeMath {

    event DepositReceived(uint256 value);
    event WithdrawPerformed(uint256 value);

    // Wealth Currency (sberTokenAddress)
    address public currency;

    // Trader
    address public trader;

    //Deposit Counter
    uint256 public deposits;

    //Withdraws Counter
    uint256 public withdraws;

    //Trades counterclaim
    uint256 public trades;

    modifier onlyOwnerOrTrader {
        require(msg.sender == owner || msg.sender == trader);
        _;
    }

    /// @dev Contract constructor
    function WealthManagement(address _currency, address _trader)
        public
    {
        currency = _currency;
        trader = _trader;
    }

    function deposit(uint256 depositAmount)
      public
      onlyOwner
    {
      require(AbstractToken(currency).transferFrom(owner, this, depositAmount));
      deposits = add(deposits, depositAmount);
      DepositReceived(depositAmount);
    }

    function withdraw(uint withdrawAmount)
      public
      onlyOwner
    {
      uint256 currentBalance = AbstractToken(currency).balanceOf(address(this));

      require(currentBalance >= withdrawAmount);

      require(AbstractToken(currency).transfer(owner, withdrawAmount));

      withdraws = add(withdraws, withdrawAmount);

      WithdrawPerformed(withdrawAmount);
    }

    function trade()
        public
        onlyOwnerOrTrader
    {
        //In this function we will implement logic of trades for AirSwap/Kyber Network/0x
        trades = trades + 1;
    }
}
