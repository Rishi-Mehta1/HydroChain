# HydroChain RLS Policy Fix Script
# This script helps you apply the Row Level Security policy fix

Write-Host "🔐 HydroChain RLS Policy Fix" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

Write-Host "The error you're seeing indicates that Row Level Security (RLS) policies" -ForegroundColor Yellow
Write-Host "are preventing user role insertion during signup." -ForegroundColor Yellow
Write-Host ""

Write-Host "To fix this issue, you have two options:" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Option 1: Apply SQL Fix (Recommended)" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to your Supabase dashboard" -ForegroundColor White
Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the contents of 'fix-user-roles-rls.sql'" -ForegroundColor White
Write-Host "4. Run the SQL script" -ForegroundColor White
Write-Host ""
Write-Host "The SQL file contains policies that will allow:" -ForegroundColor Gray
Write-Host "• Users to insert their own roles during signup" -ForegroundColor Gray
Write-Host "• Users to view their own roles" -ForegroundColor Gray
Write-Host "• Service role to manage all roles" -ForegroundColor Gray
Write-Host "• Anonymous users to insert roles during signup" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Option 2: Code-based Workaround (Already Applied)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "I've updated your AuthContext.js to handle RLS policy issues:" -ForegroundColor White
Write-Host "• Roles are stored temporarily in localStorage if immediate insertion fails" -ForegroundColor Gray
Write-Host "• Roles are inserted when users sign in after email confirmation" -ForegroundColor Gray
Write-Host "• Fallback mechanisms ensure users always get a role" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 Testing the Fix" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "After applying the SQL fix, test the signup process:" -ForegroundColor White
Write-Host ""
Write-Host "1. Start your development server: npm start" -ForegroundColor Yellow
Write-Host "2. Go to /signup and create a test user" -ForegroundColor Yellow
Write-Host "3. Check the browser console for role insertion messages" -ForegroundColor Yellow
Write-Host "4. Sign in with the new user and verify the role is set correctly" -ForegroundColor Yellow
Write-Host ""

Write-Host "🐛 Troubleshooting" -ForegroundColor Red
Write-Host "==================" -ForegroundColor Red
Write-Host ""
Write-Host "If you still see RLS errors after applying the SQL fix:" -ForegroundColor White
Write-Host ""
Write-Host "1. Check Supabase Dashboard > Authentication > Settings" -ForegroundColor Yellow
Write-Host "   - Ensure 'Enable email confirmations' matches your needs" -ForegroundColor Gray
Write-Host "   - If email confirmation is enabled, users must confirm before role insertion" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verify the user_roles table structure:" -ForegroundColor Yellow
Write-Host "   - Should have columns: id, user_id (UUID), role (text), created_at" -ForegroundColor Gray
Write-Host "   - user_id should reference auth.users(id)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check that RLS is enabled on user_roles table:" -ForegroundColor Yellow
Write-Host "   Run: SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_roles';" -ForegroundColor Gray
Write-Host ""

Write-Host "📁 Files Involved" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• fix-user-roles-rls.sql - SQL script to fix RLS policies" -ForegroundColor White
Write-Host "• src/contexts/AuthContext.js - Updated with fallback mechanisms" -ForegroundColor White
Write-Host "• src/pages/SignUp.js - Updated to use new signup flow" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host ""
Write-Host "1. Apply the SQL fix from 'fix-user-roles-rls.sql'" -ForegroundColor Yellow
Write-Host "2. Test user signup and role assignment" -ForegroundColor Yellow
Write-Host "3. Run the test user creation script: .\setup-test-users.ps1" -ForegroundColor Yellow
Write-Host "4. Verify role-based navigation works correctly" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Would you like to open the SQL file now? (y/n)"

if ($response -eq 'y' -or $response -eq 'yes' -or $response -eq 'Y' -or $response -eq 'YES') {
    if (Test-Path "fix-user-roles-rls.sql") {
        Write-Host ""
        Write-Host "Opening SQL file..." -ForegroundColor Green
        notepad "fix-user-roles-rls.sql"
    } else {
        Write-Host ""
        Write-Host "❌ SQL file not found. Please ensure you're in the project root directory." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "👋 You can open 'fix-user-roles-rls.sql' manually when ready." -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Remember to copy the SQL content to your Supabase SQL Editor and run it!" -ForegroundColor Yellow
Write-Host ""
