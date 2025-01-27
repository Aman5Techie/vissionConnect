const hre = require("hardhat");

async function main() {
  const verifyuser = await hre.ethers.getContractFactory("VerifySignature");
  const contract = await verifyuser.deploy();

  await contract.deployed();

  console.log("Library deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

