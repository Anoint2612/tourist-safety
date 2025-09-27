const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const Factory = await ethers.getContractFactory("UserRegistry");

  // Deploy and wait for the transaction to be mined
  const contract = await Factory.deploy();
  await contract.waitForDeployment();  // <-- important in Hardhat v3

  console.log("UserRegistry deployed to:", contract.target); // <-- use .target
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
