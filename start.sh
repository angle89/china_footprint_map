#!/bin/bash

# 中国城市足迹地图 - 快速启动脚本
# China Footprint Map - Quick Start Script

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   🗺️  中国城市足迹地图 - 快速启动脚本                      ║"
echo "║   China Footprint Map - Quick Start                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js"
    echo ""
    echo "📥 请先安装 Node.js:"
    echo "   https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"
echo ""

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 依赖安装失败！"
        exit 1
    fi
    echo ""
    echo "✅ 依赖安装完成！"
    echo ""
fi

# 检查地图数据
if [ ! -f "public/data/china_cities.json" ]; then
    echo "📥 地图数据缺失，正在下载..."
    echo ""
    node scripts/download-cities-detailed.js
    if [ $? -ne 0 ]; then
        echo ""
        echo "⚠️  自动下载失败，尝试备用方案..."
        node scripts/download-geojson.js
    fi
    echo ""
else
    echo "✅ 地图数据已就绪"
    echo ""
fi

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   🚀 启动开发服务器...                                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "💡 提示:"
echo "   - 浏览器将自动打开 http://localhost:3000"
echo "   - 按 Ctrl+C 可以停止服务器"
echo "   - 按 h + Enter 查看帮助"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动开发服务器
npm run dev
