# apk_build.ps1 - ESH Rutin APK Builder (Pure PowerShell - Unicode Safe)
# Bu script tamamen PowerShell ile calisir, Turkce karakter sorunu olmaz.

$ErrorActionPreference = "Stop"

# Konsol kodlamasini UTF-8 yap
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- Kok dizini (bu scriptin bulundugu klasor) ---
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT = "android-app"
$APK_NAME = "ESHRutin.apk"
$projectDir = [System.IO.Path]::Combine($ROOT, $PROJECT)
$settingsGradle = [System.IO.Path]::Combine($projectDir, "settings.gradle")

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ESH Rutin APK Builder" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Proje kontrolu ---
if (-not (Test-Path $settingsGradle)) {
    Write-Host "[HATA] Android proje klasoru bulunamadi: $projectDir" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# ============================================================
# JAVA_HOME
# ============================================================
if (-not $env:JAVA_HOME) {
    $jbrPath = "C:\Program Files\Android\Android Studio\jbr"
    if (Test-Path $jbrPath) {
        $env:JAVA_HOME = $jbrPath
    }
}
if (-not $env:JAVA_HOME) {
    $javaPath = "C:\AndroidJava"
    if (Test-Path $javaPath) {
        $env:JAVA_HOME = $javaPath
    }
}
if ($env:JAVA_HOME) {
    $javaBin = [System.IO.Path]::Combine($env:JAVA_HOME, "bin")
    $env:PATH = "$javaBin;$env:PATH"
    Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "[UYARI] JAVA_HOME tanimli degil, sistem PATH'indeki Java kullanilacak." -ForegroundColor Yellow
}

# ============================================================
# ANDROID SDK - setup-sdk.ps1 scriptini calistir
# ============================================================
Write-Host ""
Write-Host "Android SDK araniyor..." -ForegroundColor Cyan

$setupSdkScript = [System.IO.Path]::Combine($projectDir, "setup-sdk.ps1")

if (-not (Test-Path $setupSdkScript)) {
    Write-Host "[HATA] setup-sdk.ps1 bulunamadi: $setupSdkScript" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# setup-sdk.ps1 calistir ve ciktisini oku
$sdkOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $setupSdkScript 2>&1

# Hata kontrolu
if ($LASTEXITCODE -ne 0) {
    Write-Host "[HATA] Android SDK bulunamadi!" -ForegroundColor Red
    $sdkOutput | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host ""
    Write-Host "Cozum: Proje kok klasorune 'sdk-path.txt' dosyasi olusturun" -ForegroundColor Yellow
    Write-Host "       ve icerisine Android SDK yolunu yazin. Ornek:" -ForegroundColor Yellow
    Write-Host "       C:\Users\KULLANICI\AppData\Local\Android\Sdk" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# SDK_PATH ve COMPILE_SDK degerlerini parse et
$SDK_DIR = $null
$COMPILE_SDK = $null

foreach ($line in $sdkOutput) {
    $lineStr = "$line"
    if ($lineStr -match "^SDK_PATH=(.+)$") {
        $SDK_DIR = $Matches[1].Trim()
    }
    elseif ($lineStr -match "^COMPILE_SDK=(.+)$") {
        $COMPILE_SDK = $Matches[1].Trim()
    }
}

if (-not $SDK_DIR) {
    Write-Host "[HATA] SDK yolu belirlenemedi!" -ForegroundColor Red
    Write-Host "setup-sdk.ps1 ciktisi:" -ForegroundColor Yellow
    $sdkOutput | ForEach-Object { Write-Host "  $_" }
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

if (-not $COMPILE_SDK) {
    $COMPILE_SDK = "35"
    Write-Host "[UYARI] Compile SDK belirlenemedi, varsayilan 35 kullaniliyor." -ForegroundColor Yellow
}

Write-Host "Android SDK: $SDK_DIR" -ForegroundColor Green
Write-Host "Compile SDK: $COMPILE_SDK" -ForegroundColor Green

# ============================================================
# Gradle'i bul
# ============================================================
Write-Host ""
Write-Host "Gradle araniyor..." -ForegroundColor Cyan

$GRADLE_BAT = $null

# 1. gradlew.bat varsa onu kullan (projenin icinde)
$gradlewPath = [System.IO.Path]::Combine($projectDir, "gradlew.bat")
if (Test-Path $gradlewPath) {
    $GRADLE_BAT = $gradlewPath
    Write-Host "gradlew.bat bulundu (proje icinde)." -ForegroundColor Green
}

# 2. Sistem PATH'inde gradle ara
if (-not $GRADLE_BAT) {
    try {
        $gradleCmd = Get-Command gradle.bat -ErrorAction SilentlyContinue
        if ($gradleCmd) {
            $GRADLE_BAT = $gradleCmd.Source
        }
    } catch { }
}

# 3. find-gradle.ps1 ile ara
if (-not $GRADLE_BAT) {
    $findGradleScript = [System.IO.Path]::Combine($projectDir, "find-gradle.ps1")
    if (Test-Path $findGradleScript) {
        try {
            $gradleResult = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $findGradleScript 2>$null
            if ($LASTEXITCODE -eq 0 -and $gradleResult) {
                $GRADLE_BAT = "$gradleResult".Trim()
            }
        } catch { }
    }
}

if (-not $GRADLE_BAT -or -not (Test-Path $GRADLE_BAT)) {
    Write-Host "" -ForegroundColor Red
    Write-Host "[HATA] Gradle bulunamadi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cozum:" -ForegroundColor Yellow
    Write-Host "  1. Android Studio ile herhangi bir projeyi bir kez sync edin" -ForegroundColor Yellow
    Write-Host "  2. Veya Gradle'i indirip PATH'e ekleyin" -ForegroundColor Yellow
    Write-Host "  3. Veya proje icine gradlew.bat kopyalayin" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

Write-Host "Gradle: $GRADLE_BAT" -ForegroundColor Green

# ============================================================
# Icon olustur
# ============================================================
$createIconsScript = [System.IO.Path]::Combine($projectDir, "create-icons.ps1")
if (Test-Path $createIconsScript) {
    Write-Host ""
    Write-Host "Ikonlar olusturuluyor..." -ForegroundColor Cyan
    try {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $createIconsScript 2>$null | Out-Null
        Write-Host "Ikonlar olusturuldu." -ForegroundColor Green
    } catch {
        Write-Host "[UYARI] Ikon olusturma basarisiz, mevcut ikonlar kullanilacak." -ForegroundColor Yellow
    }
}

# ============================================================
# Build
# ============================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  APK olusturuluyor..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Gradle'i project dizininden calistir
Push-Location $projectDir
try {
    # cmd /c ile calistir cunku gradle.bat bir batch dosyasi
    $gradleArgs = "--no-daemon --warning-mode=none :app:assembleDebug -PcompileSdkVersion=$COMPILE_SDK"
    
    # Gradle'i calistir
    $process = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c `"$GRADLE_BAT`" $gradleArgs" `
        -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Host ""
        Write-Host "[HATA] APK build basarisiz oldu! (Exit code: $($process.ExitCode))" -ForegroundColor Red
        Write-Host "Yukaridaki hata mesajini inceleyiniz." -ForegroundColor Yellow
        Pop-Location
        Read-Host "Devam etmek icin Enter'a basin"
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[HATA] Gradle calistirma hatasi: $_" -ForegroundColor Red
    Pop-Location
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}
Pop-Location

# ============================================================
# APK'yi kopyala
# ============================================================
$apkSource = [System.IO.Path]::Combine($projectDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
$apkDest = [System.IO.Path]::Combine($ROOT, $APK_NAME)

if (-not (Test-Path $apkSource)) {
    Write-Host ""
    Write-Host "[HATA] Build edilmis APK bulunamadi: $apkSource" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

try {
    Copy-Item -Path $apkSource -Destination $apkDest -Force
} catch {
    Write-Host "[HATA] APK kopyalanamadi: $_" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  BASARILI!" -ForegroundColor Green
Write-Host "  APK: $apkDest" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Read-Host "Devam etmek icin Enter'a basin"
