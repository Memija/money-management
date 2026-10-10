Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap('.tempmediaStorage/brotchenmacher.png')
$bg = $bmp.GetPixel(0, 0)
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0
for ($x = 0; $x -lt $bmp.Width; $x++) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    $p = $bmp.GetPixel($x, $y)
    $diff = [Math]::Abs($p.R - $bg.R) + [Math]::Abs($p.G - $bg.G) + [Math]::Abs($p.B - $bg.B)
    if ($diff -gt 30) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$cx = ($minX + $maxX) / 2
$cy = ($minY + $maxY) / 2
$w = $maxX - $minX
$h = $maxY - $minY
Write-Host "minX: $minX, maxX: $maxX, minY: $minY, maxY: $maxY, width: $w, height: $h, centerX: $cx, centerY: $cy"
$bmp.Dispose()
