# Package Chrome Extension for Web Store Submission
# This script creates a zip archive containing only the required extension files

# Output zip file name
$zipFileName = "organic-tab-sorter.zip"
$zipPath = Join-Path $PSScriptRoot $zipFileName

# Remove existing zip file if it exists
if (Test-Path $zipPath) {
    Write-Host "Removing existing $zipFileName..." -ForegroundColor Yellow
    Remove-Item $zipPath -Force
}

# Files and folders to include in the package
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "popup.html",
    "popup.js",
    "icons"
)

# Verify all required files exist
Write-Host "Verifying required files..." -ForegroundColor Cyan
$allFilesExist = $true
foreach ($file in $filesToInclude) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $fullPath)) {
        Write-Host "ERROR: Required file/folder not found: $file" -ForegroundColor Red
        $allFilesExist = $false
    } else {
        Write-Host "  ✓ Found: $file" -ForegroundColor Green
    }
}

if (-not $allFilesExist) {
    Write-Host "`nPackaging aborted due to missing files." -ForegroundColor Red
    exit 1
}

# Create the zip archive
Write-Host "`nCreating zip archive..." -ForegroundColor Cyan
try {
    # Build full paths for all items to include
    $itemsToCompress = $filesToInclude | ForEach-Object { Join-Path $PSScriptRoot $_ }

    # Create the zip archive
    Compress-Archive -Path $itemsToCompress -DestinationPath $zipPath -Force

    Write-Host "`n✓ Successfully created: $zipFileName" -ForegroundColor Green

    # Display zip file information
    $zipInfo = Get-Item $zipPath
    Write-Host "`nPackage Details:" -ForegroundColor Cyan
    Write-Host "  Location: $($zipInfo.FullName)"
    Write-Host "  Size: $([math]::Round($zipInfo.Length / 1KB, 2)) KB"

    # List contents of the zip
    Write-Host "`nPackage Contents:" -ForegroundColor Cyan
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $zip.Entries | ForEach-Object {
        Write-Host "  - $($_.FullName)"
    }
    $zip.Dispose()

    Write-Host "`n✓ Package ready for Chrome Web Store submission!" -ForegroundColor Green

} catch {
    Write-Host "`nERROR: Failed to create zip archive" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
