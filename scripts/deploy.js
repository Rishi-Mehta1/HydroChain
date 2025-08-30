const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log(`\n🚀 Deploying contracts on ${network} network...`);
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy GreenHydrogenCredits contract
  console.log("\n📋 Deploying GreenHydrogenCredits contract...");
  const GreenHydrogenCredits = await hre.ethers.getContractFactory("GreenHydrogenCredits");
  const creditsContract = await GreenHydrogenCredits.deploy("https://hydrochain.com/metadata/{id}");
  
  await creditsContract.waitForDeployment();
  const creditsAddress = await creditsContract.getAddress();
  console.log("✅ GreenHydrogenCredits deployed to:", creditsAddress);

  // Deploy HydrogenCreditsMarketplace contract
  console.log("\n🏪 Deploying HydrogenCreditsMarketplace contract...");
  
  // For testnet, we'll use a mock USDC address or deploy a simple ERC20 token
  let paymentTokenAddress;
  if (network === "sepolia" || network === "mumbai" || network === "hardhat") {
    console.log("Deploying mock payment token for testnet...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mock USDC", "USDC", 6); // 6 decimals for USDC
    await mockToken.waitForDeployment();
    paymentTokenAddress = await mockToken.getAddress();
    console.log("✅ Mock payment token deployed to:", paymentTokenAddress);
  } else {
    // Use actual USDC addresses for mainnet
    const usdcAddresses = {
      polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      ethereum: "0xA0b86a33E6417c4A683AB47f10e10c0f8ba0e9f6" // USDC on mainnet
    };
    paymentTokenAddress = usdcAddresses[network] || usdcAddresses.polygon;
  }

  const HydrogenCreditsMarketplace = await hre.ethers.getContractFactory("HydrogenCreditsMarketplace");
  const marketplaceContract = await HydrogenCreditsMarketplace.deploy(
    creditsAddress,
    paymentTokenAddress,
    deployer.address // Fee recipient
  );
  
  await marketplaceContract.waitForDeployment();
  const marketplaceAddress = await marketplaceContract.getAddress();
  console.log("✅ HydrogenCreditsMarketplace deployed to:", marketplaceAddress);

  // Set up roles in the credits contract
  console.log("\n🔐 Setting up roles...");
  
  // Grant roles to deployer for testing
  const PRODUCER_ROLE = await creditsContract.PRODUCER_ROLE();
  const VERIFIER_ROLE = await creditsContract.VERIFIER_ROLE();
  const AUDITOR_ROLE = await creditsContract.AUDITOR_ROLE();
  const REGULATORY_ROLE = await creditsContract.REGULATORY_ROLE();

  await creditsContract.grantRole(PRODUCER_ROLE, deployer.address);
  await creditsContract.grantRole(VERIFIER_ROLE, deployer.address);
  await creditsContract.grantRole(AUDITOR_ROLE, deployer.address);
  await creditsContract.grantRole(REGULATORY_ROLE, deployer.address);

  console.log("✅ Roles granted to deployer for testing");

  // Save deployment information
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      GreenHydrogenCredits: {
        address: creditsAddress,
        constructorArgs: ["https://hydrochain.com/metadata/{id}"]
      },
      HydrogenCreditsMarketplace: {
        address: marketplaceAddress,
        constructorArgs: [creditsAddress, paymentTokenAddress, deployer.address]
      }
    },
    paymentToken: paymentTokenAddress,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Update .env file with contract addresses
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  
  const envVarName = network === "sepolia" ? "REACT_APP_CREDITS_CONTRACT_ADDRESS" : `REACT_APP_${network.toUpperCase()}_CREDITS_CONTRACT_ADDRESS`;
  const marketplaceVarName = network === "sepolia" ? "REACT_APP_MARKETPLACE_CONTRACT_ADDRESS" : `REACT_APP_${network.toUpperCase()}_MARKETPLACE_CONTRACT_ADDRESS`;
  
  // Update or add environment variables
  envContent = updateEnvVar(envContent, envVarName, creditsAddress);
  envContent = updateEnvVar(envContent, marketplaceVarName, marketplaceAddress);
  
  if (paymentTokenAddress !== deployer.address) {
    envContent = updateEnvVar(envContent, `REACT_APP_${network.toUpperCase()}_PAYMENT_TOKEN`, paymentTokenAddress);
  }

  fs.writeFileSync(envPath, envContent);

  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
  console.log("📝 Environment variables updated");

  // Verification instructions
  console.log("\n🔍 Contract Verification:");
  console.log(`npx hardhat verify --network ${network} ${creditsAddress} "https://hydrochain.com/metadata/{id}"`);
  console.log(`npx hardhat verify --network ${network} ${marketplaceAddress} ${creditsAddress} ${paymentTokenAddress} ${deployer.address}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Etherscan/Polygonscan");
  console.log("2. Update your frontend with the new contract addresses");
  console.log("3. Test contract functionality");
}

function updateEnvVar(envContent, varName, value) {
  const regex = new RegExp(`^${varName}=.*$`, "m");
  if (regex.test(envContent)) {
    return envContent.replace(regex, `${varName}=${value}`);
  } else {
    return envContent + `\n${varName}=${value}`;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
