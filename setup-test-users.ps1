# HydroChain Test Users Setup Script
# This script helps you create and test users with different roles

Write-Host "🚀 HydroChain Test Users Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Function to check if Node.js is available
function Test-NodeJs {
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js is available: $nodeVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Node.js is not available. Please ensure Node.js is installed and in your PATH." -ForegroundColor Red
        return $false
    }
}

# Function to check if we're in the correct directory
function Test-ProjectDirectory {
    if (Test-Path "package.json") {
        $packageContent = Get-Content "package.json" | ConvertFrom-Json
        if ($packageContent.name -eq "hydrochain") {
            Write-Host "✅ You are in the HydroChain project directory" -ForegroundColor Green
            return $true
        }
    }
    Write-Host "❌ Please run this script from the HydroChain project root directory (where package.json is located)" -ForegroundColor Red
    return $false
}

# Function to start the development server
function Start-DevServer {
    Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
    Write-Host "This will start the React development server on http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Once the server starts, you can use the browser console to create test users." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server when you're done testing." -ForegroundColor Yellow
    Write-Host ""
    
    # Start the development server
    npm start
}

# Function to display test user information
function Show-TestUserInfo {
    Write-Host ""
    Write-Host "📋 Test User Information" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The following test users will be created:" -ForegroundColor White
    Write-Host ""
    
    $testUsers = @(
        @{ Role = "Producer"; Email = "producer@hydrochain.com"; Password = "Producer123!"; Dashboard = "ProducerDashboard" },
        @{ Role = "Buyer"; Email = "buyer@hydrochain.com"; Password = "Buyer123!"; Dashboard = "BuyerDashboard" },
        @{ Role = "Auditor"; Email = "auditor@hydrochain.com"; Password = "Auditor123!"; Dashboard = "AuditorDashboard" },
        @{ Role = "Regulatory"; Email = "regulatory@hydrochain.com"; Password = "Regulatory123!"; Dashboard = "Default with regulatory actions" },
        @{ Role = "Verifier"; Email = "verifier@hydrochain.com"; Password = "Verifier123!"; Dashboard = "Default with verifier actions" }
    )
    
    foreach ($user in $testUsers) {
        Write-Host "🔹 $($user.Role):" -ForegroundColor Green
        Write-Host "   Email: $($user.Email)" -ForegroundColor White
        Write-Host "   Password: $($user.Password)" -ForegroundColor White
        Write-Host "   Dashboard: $($user.Dashboard)" -ForegroundColor Gray
        Write-Host ""
    }

# Function to show browser console commands
function Show-BrowserCommands {
    Write-Host "🌐 Browser Console Commands" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Once the development server is running, open your browser to http://localhost:3000" -ForegroundColor White
    Write-Host "Then open the Developer Console (F12) and run these commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Create all test users:" -ForegroundColor Yellow
    Write-Host "   createAllTestUsers()" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Test all user logins:" -ForegroundColor Yellow
    Write-Host "   testAllUserLogins()" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Show navigation info:" -ForegroundColor Yellow
    Write-Host "   testRoleNavigation()" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. View test user configurations:" -ForegroundColor Yellow
    Write-Host "   console.table(TEST_USERS)" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Clean up test data (optional):" -ForegroundColor Yellow
    Write-Host "   cleanupTestUsers()" -ForegroundColor Green
    Write-Host ""
}

# Function to show manual testing steps
function Show-ManualTestingSteps {
    Write-Host "🧪 Manual Testing Steps" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After creating the test users, you can manually test the role-based navigation:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Go to http://localhost:3000/login" -ForegroundColor Yellow
    Write-Host "2. Login with any of the test user credentials" -ForegroundColor Yellow
    Write-Host "3. Verify you are redirected to /dashboard" -ForegroundColor Yellow
    Write-Host "4. Verify the correct dashboard component is rendered based on your role:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   • Producer → ProducerDashboard with production-specific features" -ForegroundColor Green
    Write-Host "   • Buyer → BuyerDashboard with purchasing features" -ForegroundColor Green
    Write-Host "   • Auditor → AuditorDashboard with auditing tools" -ForegroundColor Green
    Write-Host "   • Regulatory → Dashboard with regulatory oversight tools" -ForegroundColor Green
    Write-Host "   • Verifier → Dashboard with verification tools" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Check the user role badge in the top navigation" -ForegroundColor Yellow
    Write-Host "6. Verify role-specific quick action buttons are displayed" -ForegroundColor Yellow
    Write-Host "7. Test logout functionality" -ForegroundColor Yellow
    Write-Host "8. Repeat with different user roles" -ForegroundColor Yellow
    Write-Host ""
}

# Main script execution
Write-Host ""

# Check prerequisites
if (-not (Test-NodeJs)) {
    exit 1
}

if (-not (Test-ProjectDirectory)) {
    exit 1
}

# Show information
Show-TestUserInfo
Show-BrowserCommands
Show-ManualTestingSteps

# Prompt to start development server
Write-Host "🤔 Do you want to start the development server now?" -ForegroundColor Yellow
$response = Read-Host "Type 'y' or 'yes' to start the server, or any other key to exit."

if ($response -eq 'y' -or $response -eq 'yes' -or $response -eq 'Y' -or $response -eq 'YES') {
    Write-Host ""
    Start-DevServer
} else {
    Write-Host ""
    Write-Host '👋 You can start the development server later with: npm start' -ForegroundColor Green
    Write-Host 'Then follow the browser console commands above to create and test users.' -ForegroundColor Green
    Write-Host ""
}
