Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile((Resolve-Path 'public/brands/brotchenmacher.gif').Path)

# Source bounds for circular emblem: center is (111, 74.5)
# Crop size 148x148
$cropRect = New-Object System.Drawing.Rectangle(37, 1, 148, 148)

$bmp = New-Object System.Drawing.Bitmap(148, 148)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$destRect = New-Object System.Drawing.Rectangle(0, 0, 148, 148)
$g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$src.Dispose()

$outPng = (Resolve-Path '.tempmediaStorage').Path + '\brotchenmacher_centered.png'
$bmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)

$outGif = (Resolve-Path 'public/brands').Path + '\brotchenmacher.gif'
$bmp.Save($outGif, [System.Drawing.Imaging.ImageFormat]::Gif)
$bmp.Dispose()

Write-Host "Cropped to 148x148 and saved to $outGif and $outPng"
