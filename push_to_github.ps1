# PowerShell script to push the financial organizer to GitHub

# Ask for the GitHub repository URL
$repoUrl = Read-Host -Prompt "Enter your GitHub repository URL (e.g., https://github.com/yourusername/financial-organizer.git)"

# Check if the URL is provided
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "No repository URL provided. Exiting..." -ForegroundColor Red
    exit
}

# Add the remote repository
Write-Host "Adding remote repository..." -ForegroundColor Cyan
git remote add origin $repoUrl

# Verify the remote was added
Write-Host "Verifying remote repository..." -ForegroundColor Cyan
git remote -v

# Confirm with the user
$confirmation = Read-Host -Prompt "Ready to push to GitHub? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Push canceled. You can push manually later with 'git push -u origin master'" -ForegroundColor Yellow
    exit
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin master

# Check the result
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Your code is now available at: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "Failed to push to GitHub. Please check the error messages above." -ForegroundColor Red
    Write-Host "You may need to create a personal access token: https://github.com/settings/tokens" -ForegroundColor Yellow
}

# Instructions for future pushes
Write-Host "`nFor future changes, use these commands:" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Description of your changes'" -ForegroundColor White
Write-Host "git push" -ForegroundColor White

# Pause to let user read the output
Write-Host "`nPress any key to exit..." -ForegroundColor Magenta
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 