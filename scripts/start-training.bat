@echo off
REM Script training model ALMEX
REM Jalankan dari root repo: scripts\start-training.bat

echo ==========================================
echo   ALMEX - Training Model Klasifikasi
echo ==========================================
echo.

REM Cek path WinPython
set PYTHON=C:\WinPython\WPy64-31180\python-3.11.8.amd64\python.exe
if not exist "%PYTHON%" (
    echo [ERROR] WinPython tidak ditemukan di:
    echo   %PYTHON%
    echo.
    echo Pastikan WinPython terinstall di path yang benar.
    pause
    exit /b 1
)

echo [1/3] WinPython ditemukan.
echo   Path: %PYTHON%
echo.

REM Navigasi ke folder notebooks
cd /d "%~dp0\..\notebooks"
if not exist "train_and_evaluate.py" (
    echo [ERROR] File train_and_evaluate.py tidak ditemukan!
    echo   Pastikan berada di folder notebooks.
    pause
    exit /b 1
)

echo [2/3] File training ditemukan.
echo   Script: train_and_evaluate.py
echo.

REM Jalankan training
echo [3/3] Mulai training...
echo   Output model akan disimpan ke: ..\backend\ml_model\
echo   Dataset: dataset\
echo.
echo ------------------------------------------

"%PYTHON%" train_and_evaluate.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Training gagal!
    echo Cek error di atas.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Training SELESAI!
echo ==========================================
echo.
echo Model tersimpan di:
echo   backend\ml_model\arah_pipeline.pkl
echo   backend\ml_model\jenis_pipeline.pkl
echo.
echo Langkah selanjutnya:
echo   1. Copy model ke server, atau
echo   2. Push ke repo: git add backend\ml_model\*.pkl -f ^&^& git commit ^&^& git push
echo.
pause
