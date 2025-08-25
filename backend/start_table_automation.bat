@echo off
echo 🍽️ 桌位自动化管理系统启动脚本
echo ====================================
echo.

echo 🔍 检查系统状态...
php artisan tables:check-reservations --dry-run --detailed

echo.
echo 📋 选择操作:
echo 1. 启动定时任务 (推荐)
echo 2. 手动执行一次处理
echo 3. 查看系统日志
echo 4. 退出
echo.

set /p choice=请选择 (1-4):

if "%choice%"=="1" goto start_scheduler
if "%choice%"=="2" goto manual_process
if "%choice%"=="3" goto view_logs
if "%choice%"=="4" goto exit

:start_scheduler
echo.
echo ⚙️ 启动定时任务系统...
echo 注意: 这将持续运行，每5分钟自动检查一次桌位状态
echo 按 Ctrl+C 可以停止
echo.
php artisan schedule:work
goto end

:manual_process
echo.
echo 🔄 手动执行桌位状态处理...
php artisan tables:check-reservations
echo.
pause
goto end

:view_logs
echo.
echo 📋 查看最近的日志...
if exist storage\logs\table-reservations.log (
    echo === 桌位管理日志 ===
    powershell Get-Content storage\logs\table-reservations.log -Tail 20
) else (
    echo 桌位管理日志文件不存在
)
echo.
if exist storage\logs\laravel.log (
    echo === Laravel 系统日志 ===
    powershell Get-Content storage\logs\laravel.log -Tail 10
) else (
    echo Laravel 日志文件不存在
)
echo.
pause
goto end

:exit
echo 退出...
goto end

:end
echo.
echo 🎉 操作完成！
pause
