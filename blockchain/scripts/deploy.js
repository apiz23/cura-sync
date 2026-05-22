const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deployer:", deployer.address);
  console.log("Balance :", hre.ethers.formatEther(balance), "POL");

  if (balance === 0n) {
    throw new Error(
      "Deployer has 0 POL. Get test POL from https://faucet.polygon.technology (select Amoy).",
    );
  }

  const Registry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const tx = registry.deploymentTransaction();

  console.log("\n=== Deployment successful ===");
  console.log("Contract address :", address);
  console.log("Tx hash          :", tx?.hash ?? "(unknown)");
  console.log(
    "Explorer         :",
    `https://amoy.polygonscan.com/address/${address}`,
  );
  console.log("\nAdd to cura-sync-web/.env.local:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
