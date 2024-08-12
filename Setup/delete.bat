@echo off
setlocal enabledelayedexpansion

set "folderPath=C:\Users\S2009\Downloads\Solarus\Launcher and Quest Editor"

if not defined folderPath (
    echo FolderPath not found in %configFile%.
    exit /b 1
)

if not exist "%folderPath%" (
    echo Folder %folderPath% doesn't exist.
    exit /b 1
)

rmdir /s /q "%folderPath%"

if exist "%folderPath%" (
    echo Can't remove %folderPath%.
    exit /b 1
) else (
    echo %folderPath% was successfully removed.
)

set "tempScript=%TEMP%\delete_script.bat"
echo @echo off > "%tempScript%"
echo timeout /t 5 /nobreak >> "%tempScript%"
echo rmdir /s /q "%~dp0" >> "%tempScript%"
echo del "%~f0" >> "%tempScript%"
echo del "%tempScript%" >> "%tempScript%"

start /b "" cmd /c "%tempScript%"

endlocal
