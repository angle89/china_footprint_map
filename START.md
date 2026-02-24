# 🚀 项目启动指南

## 最简单的启动方法

### Windows 用户 🪟

**双击运行：**
```
start.bat
```

或在命令行中：
```cmd
start.bat
```

---

### Mac/Linux 用户 🍎🐧

```bash
chmod +x start.sh  # 首次需要添加执行权限
./start.sh
```

---

### 通用方法（所有系统）💻

```bash
npm run dev
```

---

## 📖 详细说明

### 自动启动脚本 (start.bat / start.sh) 会自动完成：

1. ✅ **检查 Node.js** - 验证开发环境
2. ✅ **安装依赖** - 首次运行时自动 npm install
3. ✅ **下载地图数据** - 自动获取中国地级市 GeoJSON
4. ✅ **启动服务器** - 运行 Vite 开发服务器
5. ✅ **打开浏览器** - 自动打开 http://localhost:3000

---

## 🎯 启动后的效果

当看到以下输出时，说明启动成功：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

浏览器会自动打开，显示完整的中国地图！🗺️

---

## 🔧 常见问题

### Q1: 提示 "npm 不是内部命令"
**A:** 需要先安装 Node.js
- 下载地址：https://nodejs.org/
- 选择 LTS 版本
- 安装后重启终端

### Q2: 端口 3000 被占用
**A:** 修改端口或关闭占用程序
```bash
# 使用其他端口
npm run dev -- --port 3001
```

### Q3: 地图数据加载失败
**A:** 重新下载数据
```bash
node scripts/download-cities-detailed.js
```

### Q4: 页面空白
**A:** 强制刷新浏览器
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 📝 手动命令（可选）

如果自动脚本无法使用，可以手动执行：

```bash
# 1. 进入项目目录
cd d:\code\china-footprint-map

# 2. 安装依赖（首次或更新后）
npm install

# 3. 下载地图数据（如果缺失）
node scripts/download-cities-detailed.js

# 4. 启动项目
npm run dev
```

---

## 🎊 现在就开始吧！

1. 运行 `start.bat` (Windows) 或 `./start.sh` (Mac/Linux)
2. 等待浏览器自动打开
3. 点击地图上的城市，开始记录您的足迹！

---

**Built with ❤️ by Zehao Chen**
