import { task } from "hardhat/config";
const web3 = require("@nomiclabs/hardhat-web3"); 

task("balance-sample", "Prints an account's balance")
    .addParam("account", "The account's balance")
    .setAction(async (taskArgs) => {
        console.log(taskArgs.account);
        // const account = web3.utils.toChecksumAddress(taskArgs.account);
        const balance = await web3.eth.getBalance(taskArgs.account);
        
        console.log(web3.utils.fromWei(balance, "ether"), "ETH");
    });

module.exports = {}; 