$roots = @($env:USERPROFILE, ($env:HOMEDRIVE + $env:HOMEPATH)) |
    Where-Object { $_ -and (Test-Path $_) } |
    Select-Object -Unique

foreach ($root in $roots) {
    $distRoot = Join-Path $root ".gradle\wrapper\dists"
    if (-not (Test-Path $distRoot)) {
        continue
    }

    $gradle = Get-ChildItem $distRoot -Recurse -Filter "gradle.bat" -ErrorAction SilentlyContinue |
        ForEach-Object {
            $version = [version]"0.0"
            if ($_.FullName -match "gradle-([0-9]+(\.[0-9]+)+)\\bin\\gradle\.bat$") {
                $version = [version]$matches[1]
            }
            [pscustomobject]@{
                Version = $version
                FullName = $_.FullName
            }
        } |
        Sort-Object Version -Descending |
        Select-Object -First 1 -ExpandProperty FullName

    if ($gradle) {
        Write-Output $gradle
        exit 0
    }
}

exit 1
