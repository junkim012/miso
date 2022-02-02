import { solidity } from 'ethereum-waffle'
import chai, { expect } from 'chai'
import hre, { ethers } from 'hardhat'
import {
  AUCTION_TOKENS,
  CROWDSALE_GOAL,
  CROWDSALE_RATE,
  CROWDSALE_RATE_2,
  CROWDSALE_TIME,
  CROWDSALE_TOKENS,
  CROWDSALE_TOKENS_2,
  DOCUMENT_DATA,
  DOCUMENT_NAME,
  ETH_ADDRESS,
  ZERO_ADDRESS,
} from './constants'
import { FixedToken as IFixedToken, Crowdsale as ICrowdsale, BatchAuction as IBatchAuction } from '../typechain'
import { setEndTime, setStartTime, deployFixedToken, e10 } from './functions'
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, BigNumberish } from 'ethers'

chai.use(solidity)

declare module 'mocha' {
  export interface Context {
    Crowdsale: ICrowdsale
    BatchAuction: IBatchAuction
    PaymentToken: IFixedToken
    AuctionToken: IFixedToken
    signers: {
      owner: SignerWithAddress
      wallet: SignerWithAddress
      beneficiary1: SignerWithAddress
      beneficiary2: SignerWithAddress
      user: SignerWithAddress
    }
  }
}

describe("BatchAuction", function () {
  this.slow(1000)

  before('', async function () {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.signers = {} as any
    ;[
      this.signers.owner,
      this.signers.wallet,
      this.signers.beneficiary1,
      this.signers.beneficiary2,
      this.signers.user,
    ] = await ethers.getSigners()
  })

  it('Init emits the correct events', async function () {
    const auctionToken = await deployFixedToken('AuctionToken', 'AT', this.signers.owner.address, CROWDSALE_TOKENS)
    const paymentToken = await deployFixedToken('PaymentToken', 'PT', this.signers.owner.address, AUCTION_TOKENS)

    // StartTime needs to be at least a bit in the future
    const startTime = BigNumber.from((await hre.ethers.provider.getBlock('latest')).timestamp + 10)
    const endTime = startTime.add(CROWDSALE_TIME)

    //const totalTokens = CROWDSALE_TOKENS; 
    const minimumCommitmentAmount = BigNumber.from('10'); 

    const batchAuction = (await (await ethers.getContractFactory('BatchAuction')).deploy()) as IBatchAuction 

    // approval should already be done in contract
    
    await auctionToken.approve(batchAuction.address, CROWDSALE_TOKENS)

    expect(
      await batchAuction.functions.initAuction(
        this.signers.owner.address,
        auctionToken.address,
        CROWDSALE_TOKENS, 
        startTime, 
        endTime,
        paymentToken.address,
        minimumCommitmentAmount,
        this.signers.owner.address,
        this.signers.owner.address,
        this.signers.owner.address,
      )
    )
        .to.emit(batchAuction, 'RoleGranted')
          .withArgs(
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            this.signers.owner.address,
            this.signers.owner.address
          )
        .and.to.emit(batchAuction,'AuctionPointListUpdated')
          .withArgs(
            this.signers.owner.address,
            true
          )
        .and.to.emit(batchAuction, 'AuctionDeployed')
          .withArgs(
            this.signers.owner.address,
            auctionToken.address,
            CROWDSALE_TOKENS,
            paymentToken.address,
            this.signers.owner.address,
            this.signers.owner.address,
          ) 
        .and.to.emit(batchAuction, 'AuctionTimeUpdated') 
          .withArgs(
            startTime,
            endTime,
          )
        .and.to.emit(batchAuction, 'AuctionPriceUpdated') 
          .withArgs(
            minimumCommitmentAmount,
          )
  })

});
