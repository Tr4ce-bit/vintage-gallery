# ============================================================
# Vintage Gallery Store — AWS Amplify Deployment Script
# Run this AFTER: aws configure + git push to GitHub
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubRepoUrl,     # e.g. https://github.com/yourname/vintage-gallery

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",

    [Parameter(Mandatory=$false)]
    [string]$AppName = "vintage-gallery"
)

Write-Host "`n🚀 Deploying Vintage Gallery to AWS Amplify..." -ForegroundColor Cyan

# 1. Create the Amplify app connected to GitHub
Write-Host "`n[1/4] Creating Amplify app..." -ForegroundColor Yellow
$app = aws amplify create-app `
    --name $AppName `
    --repository $GitHubRepoUrl `
    --platform WEB_COMPUTE `
    --region $Region `
    --output json | ConvertFrom-Json

$appId = $app.app.appId
Write-Host "✅ App created: $appId" -ForegroundColor Green

# 2. Create the production branch
Write-Host "`n[2/4] Connecting main/master branch..." -ForegroundColor Yellow
aws amplify create-branch `
    --app-id $appId `
    --branch-name master `
    --stage PRODUCTION `
    --region $Region | Out-Null
Write-Host "✅ Branch connected" -ForegroundColor Green

# 3. Set environment variables
Write-Host "`n[3/4] Setting environment variables..." -ForegroundColor Yellow
Write-Host "You'll be prompted to enter your environment variables." -ForegroundColor DarkGray

$envVars = @{}

$clerkPub = Read-Host "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
$clerkSec = Read-Host "  CLERK_SECRET_KEY"
$dbUrl    = Read-Host "  DATABASE_URL (Neon connection string)"
$psSecret = Read-Host "  PAYSTACK_SECRET_KEY"
$psPub    = Read-Host "  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"
$appUrl   = "https://master.$appId.amplifyapp.com"

$envJson = "{" +
    """NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"":""$clerkPub""," +
    """CLERK_SECRET_KEY"":""$clerkSec""," +
    """DATABASE_URL"":""$dbUrl""," +
    """PAYSTACK_SECRET_KEY"":""$psSecret""," +
    """NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"":""$psPub""," +
    """NEXT_PUBLIC_APP_URL"":""$appUrl"","+
    """NEXT_PUBLIC_CLERK_SIGN_IN_URL"":""/sign-in""," +
    """NEXT_PUBLIC_CLERK_SIGN_UP_URL"":""/sign-up""," +
    """NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"":""/""," +
    """NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"":""/""" +
    "}"

aws amplify update-app `
    --app-id $appId `
    --environment-variables $envJson `
    --region $Region | Out-Null
Write-Host "✅ Environment variables set" -ForegroundColor Green

# 4. Trigger first deployment
Write-Host "`n[4/4] Triggering first build..." -ForegroundColor Yellow
$job = aws amplify start-job `
    --app-id $appId `
    --branch-name master `
    --job-type RELEASE `
    --region $Region `
    --output json | ConvertFrom-Json

Write-Host "✅ Build started! Job ID: $($job.jobSummary.jobId)" -ForegroundColor Green

# Done
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT INITIATED" -ForegroundColor Green
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site will be live in ~5 minutes at:"
Write-Host "  👉 https://master.$appId.amplifyapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Track build progress:"
Write-Host "  https://console.aws.amazon.com/amplify/apps/$appId" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Add custom domain: AWS Amplify Console → Domain management"
Write-Host "  2. Push your DATABASE_URL to Neon and run: npx prisma db push"
Write-Host "  3. Set your Paystack webhook to: https://master.$appId.amplifyapp.com/api/paystack/webhook"
Write-Host ""
