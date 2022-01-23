const Web3 = require('web3');
const ganache = require('ganache-cli');
const assert = require('assert');
const path = require('path');
const fs = require('fs');



const web3 = new Web3(ganache.provider());
const compiledPath = path.resolve('./', 'src', 'abis', 'Lottery.json');
let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    const compilesJson = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
    lottery = await new web3.eth.Contract(compilesJson.abi).deploy({ data: compilesJson.bytecode }).send(
        {
            from: accounts[0],
            gas: '1000000'
        }
    )
});

describe('Lottery', () => {

    it('deployed contract', () => {
        assert.ok(lottery.options.address);
    })

    it('will allow user enter the lottry', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(players[0], accounts[0]);
        assert.equal(players.length, 1);
    })

    it('will allow multiple users enter the lottry', async () => {
        const registeredPlayers = await registerAndGetPlayers();
        assert.equal(registeredPlayers.length, accounts.length);
    })

    it('requrie a valid amount to enter contract', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: 3000,
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('will allow only manager to call pickWinner', async () => {
        try {
            await registerAndGetPlayers();
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('will enter users into the contract, pick a winner and reset the players', async () => {
        await registerAndGetPlayers();
        await lottery.methods.pickWinner().send({
            from: accounts[0],
            gas: 3000000,
        });
        const winners = await lottery.methods.getWinners().call({ from: accounts[0], gas: 3000000, });
        const winnerBalance = await web3.eth.getBalance(winners[0]);
        console.log(web3.utils.fromWei(winnerBalance, 'ether'));
        assert.equal(winners.length, 1);
        assert(accounts.includes(winners[0]));
    })
})


async function registerAndGetPlayers() {
    for (var i = 0; i < accounts.length; i++) {
        await lottery.methods.enter().send({
            from: accounts[i],
            value: web3.utils.toWei('0.02', 'ether'),
            gas: 3000000,
        });
    }
    const players = await lottery.methods.getPlayers().call({
        from: accounts[0],
        gas: 3000000,
    });
    return players;
}

