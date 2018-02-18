let Token = artifacts.require('./SberToken.sol');
let constants = require('./constants.js');
let BigNumber = require('bignumber.js');


contract('SberToken.', function(accounts) {

    /*
     *  Verify that initial contract state matches with expected state
     */
    it('Should verify decimals', function(done) {
        var contract;

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.decimals.call();
        }).then(function(number) {
            assert.equal(number.toNumber(), constants.decimals, 'Decimals do not match');
        }).then(done);
    });

    it('Should verify total supply', function(done) {
        var contract;

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.totalSupply.call();
        }).then(function(supply) {
            assert.equal(supply.toNumber(), constants.totalSupply, 'Total supply is incorrect');
        }).then(done);
    });

    it('Should verify the foundation reserve address', function(done) {
        var contract;

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.foundationReserve.call();
        }).then(function(address) {
            assert.equal(address, constants.foundationReserve, 'Foundation reserve address is incorrect');
        }).then(done);
    });

    it('Should verify the foundation reserve balance', function(done) {
        var contract;

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), constants.foundationTokens,
                         'Foundation reserve balance is incorrect');
        }).then(done);
    });

    it('Should verify minting to foundation balance', function(done) {
        var contract, totalSupply, foundationBalance;

        //Mint 200 000 000 SRUB's
        let minting = new BigNumber(200000000);

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(balance) {
            foundationBalance = balance;
            return contract.totalSupply.call();
        }).then(function(supply) {
            totalSupply = supply;
            return contract.mint(minting.toNumber(), { from: constants.owner });
        }).then(function(tx) {
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(newBalance) {
            assert.equal(
              newBalance.toNumber(),
              foundationBalance.plus(
                minting.multipliedBy(
                  new BigNumber(10).pow(constants.decimals)
                )
              ).toNumber(),
              'Foundation balance is incorrect'
            );
            return contract.totalSupply.call();
        }).then(function(newSupply) {
            assert.equal(
              newSupply.toNumber(),
              totalSupply.plus(
                minting.multipliedBy(
                  new BigNumber(10).pow(constants.decimals)
                )
              ).toNumber(),
              'Total supply is incorrect'
            );
        }).then(done);
    });

    it('Should verify burning from foundation balance', function(done) {
        var contract, totalSupply, foundationBalance;

        //Burn 150 000 000 SRUB's
        let burning = new BigNumber(150000000);

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(balance) {
            foundationBalance = balance;
            return contract.totalSupply.call();
        }).then(function(supply) {
            totalSupply = supply;
            return contract.burn(burning.toNumber(), { from: constants.owner });
        }).then(function(tx) {
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(newBalance) {
            assert.equal(
              newBalance.toNumber(),
              foundationBalance.minus(
                burning.multipliedBy(
                  new BigNumber(10).pow(constants.decimals)
                )
              ).toNumber(),
              'Foundation balance is incorrect'
            );
            return contract.totalSupply.call();
        }).then(function(newSupply) {
            assert.equal(
              newSupply.toNumber(),
              totalSupply.minus(
                burning.multipliedBy(
                  new BigNumber(10).pow(constants.decimals)
                )
              ).toNumber(),
              'Total supply is incorrect'
            );
        }).then(done);
    });

    it('Should verify throw on overflowing burning', function(done) {
        var contract;

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(balance) {
            return contract.burn(balance.plus(
              new BigNumber(1).multipliedBy(
                new BigNumber(10).pow(constants.decimals)
              )
            ).toNumber(), { from: constants.owner });
        }).then(function(tx) {
            throw new Error('Owner should not be able to burn more tokens that he owns');
        }).catch(function(err) {
            assert.equal(err.message, 'VM Exception while processing transaction: revert');
        }).then(done);
    });

    it('Should verify withdrawing from reserve by owner', function(done) {
        var contract, foundationBalance;
        let withdrawAmount = new BigNumber(1);
        let withdrawAmountRaw = withdrawAmount.multipliedBy(
          new BigNumber(10).pow(constants.decimals)
        );

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(balance) {
            foundationBalance = balance;
            return contract.withdrawFromReserve(constants.newOwner, withdrawAmount.toNumber(), { from: constants.owner });
        }).then(function(tx) {
            return contract.balanceOf.call(constants.newOwner);
        }).then(function(newInvestorBalance) {
            assert.equal(newInvestorBalance.toNumber(), withdrawAmountRaw.toNumber(), 'Incorrect investor balance');
            return contract.balanceOf.call(constants.foundationReserve);
        }).then(function(newFoundationBalance) {
            assert.equal(newFoundationBalance.toNumber(), foundationBalance.minus(withdrawAmountRaw).toNumber(), 'Incorrect foundation balance');
        }).then(done);
    });

    it('Should verify not withdrawing from reserve by user', function(done) {
        var contract, foundationBalance;
        let withdrawAmount = new BigNumber(1);
        let withdrawAmountRaw = withdrawAmount.multipliedBy(
          new BigNumber(10).pow(constants.decimals)
        );

        Token.deployed().then(function(instance) {
            contract = instance;
            return contract.withdrawFromReserve(constants.newOwner, withdrawAmount.toNumber(), { from: constants.investor });
        }).then(function(tx) {
            throw new Error('Owner should not be able to burn more tokens that he owns');
        }).catch(function(err) {
            assert.equal(err.message, 'VM Exception while processing transaction: revert');
        }).then(done);
    });

});
