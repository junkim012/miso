import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "ethers"; 
import { task } from "hardhat/config";
import { Contract } from "ethers";

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
            "totalTokens",
            "The total number of tokens to be auctioned off"
        )
        .addParam(
            "startTime",
            "The start time of the auction"
        )
        .addParam(
            "endTime",
            "The end time of the auction"
        )
        .addParam(
            "paymentCurrency",
            "The token being used to purchase the token being auctioned off"
        )
        .addParam(
            "minimumCommitmentAmount",
            "The minimum amount collected at which the auction will be successful"
        )
        .addParam(
            "admin",
            "address that can finalize the auction"
        )
        .addParam(
            "pointList",
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
            
            const token = await hre.ethers.getContractAt(
                "ERC20",
                taskArgs.token
            )
            const paymentCurrency = await hre.ethers.getContractAt(
                "ERC20",
                taskArgs.paymentCurrency
            )

            /*
             totalTokens and minimumCommitmentAmount are inputted without 18 zeros
             and later converted here. 
             */
            const totalTokens = ethers.utils.parseUnits(
                taskArgs.totalTokens,
                await token.callStatic.decimals(),
            )

            const minimumCommitmentAmount = ethers.utils.parseUnits(
                taskArgs.minimumCommitmentAmount,
                await paymentCurrency.callStatic.decimals(), 
            )

            console.log("Using BatchAuction deployed to: ", )

            const allowance = await token.callStatic.allowance(
                caller.address,
                batchAuction.address,
            );
            if (totalTokens.gt(allowance)) {
                console.log("totalTokens greater than allowance, approving tokens"); 
                const tx = await token
                    .connect(caller)
                    .approve(batchAuction.address, totalTokens);
                await tx.wait(); 
                console.log("Approved"); 
            }

            console.log("Starting Auction: "); 
            const tx = await batchAuction
                .connect(caller)
                .initMarket(
                    taskArgs.funder,
                    taskArgs.token,
                    totalTokens,
                    taskArgs.startTime,
                    taskArgs.endTime,
                    taskArgs.paymentCurrency,
                    minimumCommitmentAmount,
                    taskArgs.admin,
                    taskArgs.pointList,
                    taskArgs.wallet
                );

            const txResult = await tx.wait(); 
            console.log(
                "txResult: ", txResult
            ); 

        })
