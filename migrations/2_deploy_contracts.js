let Token = artifacts.require("./SberToken.sol");
let WealthManagement = artifacts.require("./WealthManagement.sol");

module.exports = function(deployer, network, accounts) {
		// 0 — owner
		// 1 — newOwner
    // 2 - trader
    deployer.deploy(Token, { overwrite: true }).then(function() {
		  return deployer.deploy(WealthManagement, Token.address, accounts[2], { overwrite: true, from: accounts[1] });
		});
};
