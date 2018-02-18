module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4000000,
      network_id: "*" // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      gas: 4000000,
      network_id: "5777" // Match any network id
    },
    kovan : {
      host: "52.57.192.243",
      port: 8545,
      network_id: "*", // Match any network id,
      gas: 4000000,
      gasPrice: 20000000000,
      from: "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a"
    }
  }
};
