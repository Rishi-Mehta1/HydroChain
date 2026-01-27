const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log(`🚀 Deploying Simple Green Hydrogen Credits on ${network}...`);
  console.log("Deploying with account:", deployer.address);
  // formatEther might fail if ethers version mismatch, checking safety
  // ethers v6 uses formatEther directly on rules? No, ethers.formatEther
  console.log(
    "Account balance:",
    hre.ethers.formatEther(
      await deployer.provider.getBalance(deployer.address),
    ),
    "ETH",
  );

  // Deploy SimpleGreenHydrogenCredits contract
  console.log("\n📋 Deploying SimpleGreenHydrogenCredits contract...");
  const SimpleGreenHydrogenCredits = await hre.ethers.getContractFactory(
    "SimpleGreenHydrogenCredits",
  );
  const creditsContract = await SimpleGreenHydrogenCredits.deploy({
    gasLimit: 5000000,
  });

  await creditsContract.waitForDeployment();
  const creditsAddress = await creditsContract.getAddress();
  console.log("✅ SimpleGreenHydrogenCredits deployed to:", creditsAddress);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  const updateEnvVar = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  updateEnvVar("CREDITS_CONTRACT_ADDRESS", creditsAddress);
  updateEnvVar("REACT_APP_CREDITS_CONTRACT_ADDRESS", creditsAddress);

  if (network === "localhost") {
    updateEnvVar("REACT_APP_BLOCKCHAIN_NETWORK", "localhost");
  } else if (network === "sepolia") {
    updateEnvVar("REACT_APP_BLOCKCHAIN_NETWORK", "sepolia");
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
      symbol: "GHC",
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-simple.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
  console.log("📝 Environment variables updated");

  // Skip verification on localhost
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n🔍 Contract Verification:");
    console.log(`npx hardhat verify --network ${network} ${creditsAddress}`);
  }

  console.log("\n🎉 Simple deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
