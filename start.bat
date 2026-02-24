@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   🗺️  中国城市足迹地图 - 快速启动脚本                      ║
echo ║   China Footprint Map - Quick Start                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo.
    echo 📥 请先安装 Node.js:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装: 
node --version
echo.

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成！
    echo.
)

REM 检查地图数据
if not exist "public\data\china_cities.json" (
    echo 📥 地图数据缺失，正在下载...
    echo.
    node scripts\download-cities-detailed.js
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ⚠️  自动下载失败，尝试备用方案...
        node scripts\download-geojson.js
    )
    echo.
) else (
    echo ✅ 地图数据已就绪
    echo.
)

echo ╔═══════════════════════════════════════════════════════════╗
echo ║   🚀 启动开发服务器...                                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 💡 提示:
echo    - 浏览器将自动打开 http://localhost:3000
echo    - 按 Ctrl+C 可以停止服务器
echo    - 按 h + Enter 查看帮助
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 启动开发服务器
call npm run dev
