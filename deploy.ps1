# DevCollab 1-Click Deployment Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " DevCollab Platform - Deploying to GitHub" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test frontend build before pushing
$env:Path = "C:\Program Files\nodejs;$env:Path"
Write-Host "`n[1/4] Testing Frontend Production Build..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed! Aborting deploy." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host " Frontend build passed!" -ForegroundColor Green

# Stage all files
Write-Host "`n[2/4] Staging changes..." -ForegroundColor Yellow
git add -A

# Commit
Write-Host "`n[3/4] Committing changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    git commit -m "Deploy: automated GitHub Pages workflow, Docker configs, and production blueprints"
} else {
    Write-Host "No changes to commit." -ForegroundColor Gray
}

# Push to GitHub
Write-Host "`n[4/4] Pushing to GitHub (origin main)..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host " Successfully deployed to GitHub!" -ForegroundColor Green
Write-Host " GitHub Pages URL: https://tembarenigoutham.github.io/Developer-Collaboration-Platform/" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
