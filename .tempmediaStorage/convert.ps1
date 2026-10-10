Add-Type -AssemblyName System.Drawing
$inPath = (Resolve-Path 'public/brands/brotchenmacher.gif').Path
$outPath = (Resolve-Path '.tempmediaStorage').Path + '\brotchenmacher.png'
$image = [System.Drawing.Image]::FromFile($inPath)
$image.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$image.Dispose()
Write-Host "Saved to $outPath"
