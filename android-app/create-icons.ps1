Add-Type -AssemblyName System.Drawing

$resRoot = Join-Path $PSScriptRoot "app\src\main\res"
$icons = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($density in $icons.Keys) {
    $size = $icons[$density]
    $dir = Join-Path $resRoot $density
    New-Item -ItemType Directory -Force -Path $dir | Out-Null

    foreach ($isRound in @($false, $true)) {
        $bitmap = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.Clear([System.Drawing.Color]::Transparent)

        $background = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 13, 31, 45))
        $accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 247, 201, 72))
        $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 13, 31, 45))
        $shape = New-Object System.Drawing.Drawing2D.GraphicsPath

        if ($isRound) {
            $shape.AddEllipse(0, 0, $size, $size)
        } else {
            $radius = [int]($size * 0.22)
            $diameter = $radius * 2
            $shape.AddArc(0, 0, $diameter, $diameter, 180, 90)
            $shape.AddArc($size - $diameter - 1, 0, $diameter, $diameter, 270, 90)
            $shape.AddArc($size - $diameter - 1, $size - $diameter - 1, $diameter, $diameter, 0, 90)
            $shape.AddArc(0, $size - $diameter - 1, $diameter, $diameter, 90, 90)
            $shape.CloseFigure()
        }

        $graphics.FillPath($background, $shape)
        $padding = [int]($size * 0.18)
        $inner = New-Object System.Drawing.Rectangle $padding, $padding, ($size - 2 * $padding), ($size - 2 * $padding)
        $innerText = New-Object System.Drawing.RectangleF ([single]$inner.X), ([single]$inner.Y), ([single]$inner.Width), ([single]$inner.Height)
        $graphics.FillEllipse($accent, $inner)

        $font = New-Object System.Drawing.Font "Arial", ([single]($size * 0.26)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $graphics.DrawString("ES", $font, $textBrush, $innerText, $format)

        $fileName = if ($isRound) { "ic_launcher_round.png" } else { "ic_launcher.png" }
        $bitmap.Save((Join-Path $dir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)

        $format.Dispose()
        $font.Dispose()
        $shape.Dispose()
        $background.Dispose()
        $accent.Dispose()
        $textBrush.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}
