const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

//manually setting up provider which contains
//1. account mnemonic which is enough for public and private keys
//2. infura link to rinkeby network
const provider = new HDWalletProvider(
	"pnemonic phrase",
	"https://rinkeby.infura.io/v3/cf03ab062ff3475baf74edddfb1e8338"
);

//passing our provider to Web3 constructor in order to get an instance of Web3
const web3 = new Web3(provider);

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();
	//a single mnemonic have multiple accounts

	console.log("Deploying from account :", accounts[0]);

	const result = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ gas: 1000000, from: accounts[0] });

	console.log(interface);
	console.log("Contract deployed to :", result.options.address);

	provider.engine.stop();
};

deploy().catch((e) => {
	console.log(e);
});
