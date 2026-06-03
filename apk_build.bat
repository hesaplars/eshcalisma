@echo off
:: ESH Rutin APK Builder - PowerShell Launcher
:: Bu dosya sadece PowerShell scriptini calistirir.
:: Tum mantik apk_build.ps1 dosyasindadir.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0apk_build.ps1"
