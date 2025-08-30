const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log(`🚀 Deploying Simple Green Hydrogen Credits on ${network}...`);
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy SimpleGreenHydrogenCredits contract
  console.log("\n📋 Deploying SimpleGreenHydrogenCredits contract...");
  const SimpleGreenHydrogenCredits = await hre.ethers.getContractFactory("SimpleGreenHydrogenCredits");
  const creditsContract = await SimpleGreenHydrogenCredits.deploy();
  
  await creditsContract.waitForDeployment();
  const creditsAddress = await creditsContract.getAddress();
  console.log("✅ SimpleGreenHydrogenCredits deployed to:", creditsAddress);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  
  // Update the contract address
  const regex = /^CREDITS_CONTRACT_ADDRESS=.*$/m;
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `CREDITS_CONTRACT_ADDRESS=${creditsAddress}`);
  } else {
    envContent += `\nCREDITS_CONTRACT_ADDRESS=${creditsAddress}`;
  }

  fs.writeFileSync(envPath, envContent);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contract: {
      name: "SimpleGreenHydrogenCredits",
      address: creditsAddress,
      symbol: "GHC"
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-simple.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
  console.log("📝 Environment variables updated");

  console.log("\n🔍 Contract Verification:");
  console.log(`npx hardhat verify --network ${network} ${creditsAddress}`);

  console.log("\n🎉 Simple deployment completed!");
  console.log("\nNext steps:");
  console.log("1. Verify contract on Etherscan");
  console.log("2. Generate test data");
  console.log("3. Test the application");
  
  console.log("\n📋 Contract Functions Available:");
  console.log("- issueCredit(volume, metadataURI)");
  console.log("- transferCredit(to, tokenId)");
  console.log("- retireCredit(tokenId)");
  console.log("- getCreditInfo(tokenId)");
  console.log("- getUserCredits(userAddress)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
