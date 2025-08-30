# PowerShell script to deploy Edge Functions to Supabase manually
# This bypasses the need for Supabase CLI

$projectRef = "kotakdgdunayyvdrhboq"
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $serviceRoleKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables" -ForegroundColor Red
    Write-Host "💡 Make sure to set it in your .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Deploying Edge Functions to Supabase..." -ForegroundColor Green
Write-Host "📋 Project: $projectRef" -ForegroundColor Cyan

# Read the Edge Function code
$functionPath = "supabase/functions/issue-credit-simple/index.ts"
if (-not (Test-Path $functionPath)) {
    Write-Host "❌ Edge Function file not found: $functionPath" -ForegroundColor Red
    exit 1
}

$functionCode = Get-Content $functionPath -Raw

Write-Host "✅ Edge Function code loaded" -ForegroundColor Green
Write-Host "📦 Function size: $($functionCode.Length) characters" -ForegroundColor Cyan

# Deploy using REST API (this is a simplified approach)
Write-Host "⚠️  Manual Edge Function deployment requires Supabase CLI" -ForegroundColor Yellow
Write-Host "🔗 Alternative: Update .env to use the existing deployed function" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "1. Install Docker Desktop" -ForegroundColor White
Write-Host "2. Install Supabase CLI: scoop install supabase" -ForegroundColor White
Write-Host "3. Run: supabase login" -ForegroundColor White
Write-Host "4. Run: supabase functions deploy --project-ref $projectRef" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Or we can continue with mock data for now and deploy later!" -ForegroundColor Yellow
