# 中国城市足迹地图 | China Footprint Map

> 交互式中国城市足迹记录，建筑师美学风格

## 功能

| 操作 | 说明 |
|---|---|
| **点击城市** | 点亮 / 取消点亮该城市（蓝色渐变填充） |
| **省级联动** | 点亮某城市后，同省其余城市自动变为浅黄色背景 |
| **省界加粗** | 叠加省级边界线，视觉区分更清晰 |
| **城市搜索** | 顶栏输入框输入城市名（支持模糊匹配），下拉选择即可点亮 |
| **导出 PNG / JPG** | 始终以完整全国地图为基准导出，不受当前缩放影响，2x 高清 |
| **导出数据** | 将访问记录下载为 JSON 文件 |
| **清空所有** | 二次确认后清空全部记录 |
| **数据持久化** | 所有记录自动保存至 LocalStorage，刷新后不丢失 |

---

## 技术栈

- **Vue 3** — Composition API
- **ECharts 5** — 地图可视化（`geo` 组件 + `lines` 省界叠加）
- **Vite** — 构建与开发服务器
- **Tailwind CSS** — 样式辅助

---

## 目录结构

```
china-footprint-map/
├── public/data/
│   ├── china_cities.json            # 地级市 GeoJSON（475 个城市）
│   └── china_provinces.json         # 省级 GeoJSON（省界线数据）
├── src/
│   ├── components/ChinaMap.vue      # 核心地图组件
│   ├── composables/useFootprint.js  # 足迹数据管理
│   ├── assets/styles/               # 样式
│   ├── App.vue
│   └── main.js
└── package.json
```

---

## 快速启动

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:3000

构建生产版本：

```bash
npm run build
npm run preview
```

---

## 数据格式

LocalStorage key: china_footprint_data

```json
{
  "visitedCities": [
    {
      "name": "南京市",
      "adcode": "320100",
      "visitDate": "2026-02-24T10:30:00.000Z",
      "notes": ""
    }
  ],
  "lastUpdated": "2026-02-24T10:30:00.000Z"
}
```
