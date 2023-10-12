const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("FerroRewards Contract", function () {
  let deployer;
  let user1;
  let user2;
  let ferroRewards;

  before(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    
    // Deploy the NFT contracts (or generate random addresses)
    const ironNFTContract = ethers.Wallet.createRandom().address;
    const nickelNFTContract = ethers.Wallet.createRandom().address;
    const cobaltNFTContract = ethers.Wallet.createRandom().address;

    const FerroRewards = await ethers.getContractFactory("FerroRewards");
    ferroRewards = await FerroRewards.deploy(
      ironNFTContract,
      nickelNFTContract,
      cobaltNFTContract
    );
    
  });

  it("Should deploy the contract", async function () {
    expect(ferroRewards.address).to.not.be.undefined;
  });

  it("Owner should be set to the deployer", async function () {
    const owner = await ferroRewards.owner();
    expect(owner).to.equal(deployer.address);
  });

  it("Should deposit tokens using depositTokens function", async function () {
    const tokenAddress = deployer.address; // Replace with a valid token address
    const amount = 10000; // Replace with the amount you want to deposit
    await expect(ferroRewards.connect(user1).depositTokens(amount, tokenAddress))
      .to.emit(ferroRewards, "Deposit")
      .withArgs(user1.address, amount, tokenAddress);
  });

  it("Should revert on depositTokens with zero amount", async function () {
    const tokenAddress = deployer.address; // Replace with a valid token address
    await expect(ferroRewards.connect(user1).depositTokens(0, tokenAddress)).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("Should revert on depositTokens with invalid token address", async function () {
    const tokenAddress = ethers.constants.AddressZero; // Invalid address
    const amount = 10000; // Replace with the amount you want to deposit
    await expect(ferroRewards.connect(user1).depositTokens(amount, tokenAddress)).to.be.revertedWith(
      "Invalid token address"
    );
  });

  it("Should add token address to the array on depositTokens", async function () {
    const tokenAddress = deployer.address; // Replace with a valid token address
    const amount = 10000; // Replace with the amount you want to deposit
    await ferroRewards.connect(user1).depositTokens(amount, tokenAddress);
    const depositedTokens = await ferroRewards.getDepositedTokens();
    expect(depositedTokens).to.include(tokenAddress);
  });

  it("Should not allow tokenDistribution function to be called when paused", async function () {
    await ferroRewards.pause();
    const tokenAddress = deployer.address; // Replace with a valid token address
    const amount = 10000; // Replace with the amount you want to deposit
    await expect(ferroRewards.connect(user1).depositTokens(amount, tokenAddress)).to.be.revertedWith(
      "Pausable: paused"
    );
  });

  it("Should update rewards balance mapping correctly on depositTokens", async function () {
    const tokenAddress = deployer.address; // Replace with a valid token address
    const amount = 10000; // Replace with the amount you want to deposit
    await ferroRewards.connect(user1).depositTokens(amount, tokenAddress);
    const rewardsBalance = await ferroRewards.rewardsBalance(
      ferroRewards.ironNFTContract,
      tokenAddress
    );
    expect(rewardsBalance).to.equal((amount * 5000) / 10000); // Assuming Iron percentage is 50%
  });

  it("Total allocation should equal the deposited amount on depositTokens", async function () {
    const tokenAddress = deployer.address; // Replace with a valid token address
    const amount = 10000; // Replace with the amount you want to deposit
    await ferroRewards.connect(user1).depositTokens(amount, tokenAddress);
    const totalTokenDistribution = await ferroRewards.totalTokenDistribution(tokenAddress);
    expect(totalTokenDistribution).to.equal(amount);
  });
});
