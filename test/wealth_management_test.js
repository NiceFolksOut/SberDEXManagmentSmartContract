let Token = artifacts.require('./SberToken.sol');
let WealthManagement = artifacts.require('./WealthManagement.sol');
let constants = require('./constants.js');
let BigNumber = require('bignumber.js');


contract('WealthManagement.', function(accounts) {

    var sberTokenAddress, wealthManagementAddress, tradesCount;
    /*
     *  Verify that initial contract state matches with expected state
     */
    it('Should send user money', function(done) {
        var contract;
        let withdrawAmount = new BigNumber(1000000);
        let withdrawAmountRaw = withdrawAmount.multipliedBy(
          new BigNumber(10).pow(constants.decimals)
        );

        Token.deployed().then(function(instance) {
            sberTokenAddress = instance.address;
            contract = instance;
            return contract.withdrawFromReserve(constants.newOwner, withdrawAmount.toNumber(), { from: constants.owner });
        }).then(function(tx) {
            return contract.balanceOf.call(constants.newOwner);
        }).then(function(newBalanceOfOwner) {
            assert.equal(newBalanceOfOwner.toNumber(), withdrawAmountRaw.toNumber(), 'Incorrect owner balance');
        }).then(done);

    });

    it('Should set wealth managment currency', function(done) {

        var contract;

        WealthManagement.deployed().then(function(instance) {
            wealthManagementAddress = instance.address;
            contract = instance;
            return contract.currency.call();
        }).then(function(currency) {
            assert.equal(sberTokenAddress, currency)
        }).then(done);

    });

    it('Should deposit to wealth managment', function(done) {

        var tokenContract, wealthContract;
        let depositAmount = new BigNumber(250000);
        let depositAmountRaw = depositAmount.multipliedBy(
          new BigNumber(10).pow(constants.decimals)
        );

        Token.at(sberTokenAddress).then(function(instance) {
            tokenContract = instance;
            return tokenContract.balanceOf.call(constants.newOwner);
        }).then(function(balance) {
            return tokenContract.approve(wealthManagementAddress, depositAmountRaw.toNumber(), { from: constants.newOwner });
        }).then(function(tx) {
            return tokenContract.allowance.call(constants.newOwner, wealthManagementAddress);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), depositAmountRaw.toNumber(), 'Incorrect allowance for Wealth Managment');
        }).then(function() {
              WealthManagement.at(wealthManagementAddress).then(function(instance) {
                   wealthContract = instance;
                   return wealthContract.deposit(depositAmountRaw.toNumber(), { from: constants.newOwner });
              }).then(function(tx) {
                  assert.equal(tx.logs[0].event, 'DepositReceived');
              }).then(function() {
                  Token.at(sberTokenAddress).then(function(instance) {
                      contract = instance;
                      return contract.balanceOf.call(wealthManagementAddress);
                  }).then(function(balance) {
                      assert.equal(balance.toNumber(), depositAmountRaw.toNumber(), 'Incorrect balance for Wealth Managment');
                  }).then(done);
            });
        });
    });

    it('Should withdraw from wealth managment', function(done) {

        var wealthContract, userBalance, wealthManagmentBalance;
        let withdrawAmount = new BigNumber(100000);
        let withdrawAmountRaw = withdrawAmount.multipliedBy(
          new BigNumber(10).pow(constants.decimals)
        );

        Token.at(sberTokenAddress).then(function(instance) {
            tokenContract = instance;
            return tokenContract.balanceOf.call(constants.newOwner);
        }).then(function(uBalance) {
            //console.log('User balance: '+uBalance.toNumber());
            userBalance = uBalance;
            return tokenContract.balanceOf.call(wealthManagementAddress);
        }).then(function(wBalance) {
            //console.log('Wealth balance: '+wBalance.toNumber());
            wealthManagmentBalance = wBalance;
        }).then(function() {
            WealthManagement.at(wealthManagementAddress).then(function(instance) {
                 wealthContract = instance;
                 return wealthContract.withdraw(withdrawAmountRaw.toNumber(), { from: constants.newOwner });
            }).then(function(tx) {
                assert.equal(tx.logs[0].event, 'WithdrawPerformed');
            }).then(function() {
                Token.at(sberTokenAddress).then(function(instance) {
                    tokenContract = instance;
                    return tokenContract.balanceOf.call(constants.newOwner);
                }).then(function(balance) {
                    assert.equal(balance.toNumber(), userBalance.plus(withdrawAmountRaw).toNumber(), 'Incorrect user balance.');
                    return tokenContract.balanceOf.call(wealthManagementAddress);
                }).then(function(balance) {
                    assert.equal(balance.toNumber(), wealthManagmentBalance.minus(withdrawAmountRaw).toNumber(), 'Incorrect wealth balance.');
                }).then(done);
            });
        });
    });

    it('Owner should be able to trade', function(done) {

      WealthManagement.at(wealthManagementAddress).then(function(instance) {
           wealthContract = instance;
           return wealthContract.trades.call();
      }).then(function(trades) {
          tradesCount = trades;
          return wealthContract.trade({ from: constants.newOwner });
      }).then(function(tx) {
          return wealthContract.trades.call();
      }).then(function(trades) {
          assert.equal(trades.toNumber(), tradesCount.plus(new BigNumber(1)).toNumber(), 'Trade was not performed');
      }).then(done);
    });

    it('Trader should be able to trade', function(done) {

      WealthManagement.at(wealthManagementAddress).then(function(instance) {
           wealthContract = instance;
           return wealthContract.trades.call();
      }).then(function(trades) {
          tradesCount = trades;
          return wealthContract.trade({ from: constants.trader });
      }).then(function(tx) {
          return wealthContract.trades.call();
      }).then(function(trades) {
          assert.equal(trades.toNumber(), tradesCount.plus(new BigNumber(1)).toNumber(), 'Trade was not performed');
      }).then(done);

    });

    it('Random user should not be able to trade', function(done) {

      WealthManagement.at(wealthManagementAddress).then(function(instance) {
           wealthContract = instance;
           return wealthContract.trade({ from: constants.owner });
      }).then(function(tx) {
          throw new Error('Random user should not be able to trade');
      }).catch(function(err) {
          assert.equal(err.message, 'VM Exception while processing transaction: revert');
      }).then(done);

    });

});
