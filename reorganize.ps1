# Create new directory structure
$directories = @(
    "client/src/main",
    "client/src/renderer/webfiles",
    "client/config",
    "server/src/routes",
    "server/src/controllers",
    "server/src/models",
    "server/src/middleware",
    "server/src/utils",
    "server/config",
    "server/public",
    "server/data",
    "deployment/scripts",
    "deployment/systemd"
)

# Create directories
foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created directory: $dir"
}

# Move client files
Write-Host "Moving client files..."
Move-Item -Force "client/index.js" "client/src/main/index.js" -ErrorAction SilentlyContinue
Move-Item -Force "client/webfiles/*" "client/src/renderer/webfiles/" -ErrorAction SilentlyContinue
Move-Item -Force "client/config.json" "client/config/config.json" -ErrorAction SilentlyContinue

# Move server files
Write-Host "Moving server files..."
Move-Item -Force "server/index.js" "server/src/index.js" -ErrorAction SilentlyContinue
Move-Item -Force "server/routes/*" "server/src/routes/" -ErrorAction SilentlyContinue
Move-Item -Force "server/controllers/*" "server/src/controllers/" -ErrorAction SilentlyContinue

# Move HTML files to public
Write-Host "Moving public files..."
$publicFiles = @(
    "menu.html",
    "news.html",
    "offers.html"
)
foreach ($file in $publicFiles) {
    if (Test-Path "server/data/$file") {
        Move-Item -Force "server/data/$file" "server/public/$file"
    }
}

# Move dashboard files
Write-Host "Moving dashboard files..."
$dashboardFiles = @(
    "panel.html",
    "settings.html",
    "uploadmedia.html",
    "menuedit.html",
    "media.html",
    "offersedit.html",
    "newadvertisement.html",
    "advertising.html"
)
foreach ($file in $dashboardFiles) {
    if (Test-Path "server/data/$file") {
        Move-Item -Force "server/data/$file" "server/public/$file"
    }
}

# Move deployment files
Write-Host "Moving deployment files..."
if (Test-Path "caf-client") {
    Move-Item -Force "caf-client/cafclient.service" "deployment/systemd/" -ErrorAction SilentlyContinue
    Move-Item -Force "caf-client/deploy.sh" "deployment/scripts/" -ErrorAction SilentlyContinue
    Move-Item -Force "caf-client/readme.txt" "README.md" -ErrorAction SilentlyContinue
}

# Clean up old directories
Write-Host "Cleaning up..."
if (Test-Path "caf-client") { Remove-Item -Recurse -Force "caf-client" }
if (Test-Path "client/webfiles") { Remove-Item -Recurse -Force "client/webfiles" }

# Create necessary data files
Write-Host "Creating data files..."
$dataFiles = @{
    "server/data/offers.json" = "[]"
    "server/data/settings.json" = "{}"
    "server/data/menuentries.json" = "[]"
    "server/data/menuSelections.json" = "{}"
    "server/data/advertisements.json" = "[]"
    "server/config/display-config.json" = Get-Content "server/config/display-config.json" -Raw -ErrorAction SilentlyContinue
}

foreach ($file in $dataFiles.Keys) {
    if (-not (Test-Path $file)) {
        $content = if ($dataFiles[$file]) { $dataFiles[$file] } else { "{}" }
        Set-Content -Path $file -Value $content
        Write-Host "Created file: $file"
    }
}

Write-Host "Reorganization complete!"
Write-Host "Please check the following:"
Write-Host "1. Verify all files were moved correctly"
Write-Host "2. Update import paths in server/src/index.js"
Write-Host "3. Update client configuration in client/config/config.json"
Write-Host "4. Test the application" 