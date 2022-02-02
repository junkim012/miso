import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "ethers"; 
import { task } from "hardhat/config";
import { Contract } from "ethers";
import { minimum } from "@sushiswap/core-sdk";

    task("initMarket", "Starts a new batch auction")
        .addParam(
            "funder",
            "The address of the wallet supplying the token to be auctioned off"
        )
        .addParam(
            "token",
            "The address of the token being auctioned off"
        )
        .addParam(
            "totaltokens",
            "The total number of tokens to be auctioned off"
        )
        .addParam(
            "starttime",
            "The start time of the auction"
        )
        .addParam(
            "endtime",
            "The end time of the auction"
        )
        .addParam(
            "paymentcurrency",
            "The token being used to purchase the token being auctioned off"
        )
        .addParam(
            "minimumcommitmentamount",
            "The minimum amount collected at which the auction will be successful"
        )
        .addParam(
            "admin",
            "address that can finalize the auction"
        )
        .addParam(
            "pointlist",
            "address that manages auction approvals"
        )
        .addParam(
            "wallet",
            "address where the collected funds will be forwarded to"
        )
        .setAction(async (taskArgs, hre) => {

            const [caller] = await hre.ethers.getSigners(); 
            console.log("Using the account: ", caller.address); 

            const authenticatorDeployment = await hre.deployments.get("BatchAuction");
            const authenticator = new Contract(
                authenticatorDeployment.address,
                authenticatorDeployment.abi
            ).connect(hre.ethers.provider); 

            const batchAuction = authenticator; 
            
            console.log('batchAuction: ', batchAuction); 

            const token = await hre.ethers.getContractAt(
                "ERC20",
                taskArgs.token
            )

            console.log('token: ', token); 


            const paymentCurrency = await hre.ethers.getContractAt(
                "ERC20",
                taskArgs.paymentcurrency
            )

            /*
             totalTokens and minimumCommitmentAmount are inputted without 18 zeros
             and later converted here. 
             */
            const totalTokens = ethers.utils.parseUnits(
                taskArgs.totaltokens,
                await token.callStatic.decimals(),
            )
            console.log('totalTokens: ', totalTokens); 

            const minimumCommitmentAmount = ethers.utils.parseUnits(
                taskArgs.minimumcommitmentamount,
                await paymentCurrency.callStatic.decimals(), 
            )

            console.log('minimumCommitmentAmount: ', minimumCommitmentAmount); 

            console.log("Using BatchAuction deployed to: ", )

            const allowance = await token.callStatic.allowance(
                caller.address,
                batchAuction.address,
            );

            console.log('allowance: ', allowance); 

            if (totalTokens.gt(allowance)) {
                console.log("totalTokens greater than allowance, approving tokens"); 
                const tx = await token
                    .connect(caller)
                    .approve(batchAuction.address, totalTokens);
                await tx.wait(); 
                console.log("Approved"); 
            }

            console.log("Starting Auction: "); 
            console.log("funder: ", taskArgs.funder); 
            console.log("token: ", taskArgs.token); 
            console.log("totalTokens: ", totalTokens); 
            console.log("startTime: ", taskArgs.starttime ); 
            console.log("endTime: ", taskArgs.endtime); 
            console.log("paymentCurrency: ", taskArgs.paymentcurrency); 
            console.log("minimumCommitmentAmouont: ", minimumCommitmentAmount); 
            console.log("admin: ", taskArgs.admin); 
            console.log("pointList: ", taskArgs.pointlist); 
            console.log("wallet: ", taskArgs.wallet); 
            const tx = await batchAuction
                .connect(caller)
                .initAuction(
                    taskArgs.funder,
                    taskArgs.token,
                    totalTokens,
                    taskArgs.starttime,
                    taskArgs.endtime,
                    taskArgs.paymentcurrency,
                    minimumCommitmentAmount,
                    taskArgs.admin,
                    taskArgs.pointlist,
                    taskArgs.wallet
                );

            const txResult = await tx.wait(); 
            console.log(
                "txResult: ", txResult
            ); 

        })
