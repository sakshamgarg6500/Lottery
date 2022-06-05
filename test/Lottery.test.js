const assert = require("assert");
const ganache = require("ganache-cli"); //local test network
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile");

let lottery; //it will store instance of our contract
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: 1000000 });
});

describe("Testing the lottery contract", () => {
	it("If contract deployed", () => {
		assert.ok(lottery.options.address);
	});

	it("Entering the Lottery", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.returnPlayers().call();

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	it("Requires some minimum amount of ether to enter Lottery", async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 0,
			});
			assert(false); //acts as a break statement as it is false
		} catch (err) {
			assert.ok(err);
		}
		//try catch is used with async await syntax
		//with promises only catch statement is used
	});

	it("Pickwinner is only called by the manager", async () => {
		try {
			await lottery.methods.pickWinner().call({ from: accounts[1] });
			assert(false);
		} catch (err) {
			assert.ok(err);
		}
	});

	it("End to End test", async () => {
		//entering only one player as he will be the winner
		//makes it easy to check the initial and final balance
		await lottery.methods
			.enter()
			.send({ from: accounts[0], value: web3.utils.toWei("2", "ether") });

		const initialbalance = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({ from: accounts[0] });
		const finalBalance = await web3.eth.getBalance(accounts[0]);
		const difference = finalBalance - initialbalance;

		assert(difference > web3.utils.toWei("1.8", "ether")); //to check balamnce of winner

		assert([0], lottery.methods.returnPlayers()); //to check that players array has been reset
	});
});
