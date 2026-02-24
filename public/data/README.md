# 数据获取指南

## 快速下载完整 GeoJSON 数据

### 方法 1：阿里云 DataV（推荐）

1. 访问：http://datav.aliyun.com/portal/school/atlas/area_selector

2. 选择区域：
   - 点击「中华人民共和国」
   - 在左侧列表选择「全国」
   - 在右侧选择「地级市」

3. 下载数据：
   - 点击右上角「复制 JSON」或「下载 JSON」
   - 将下载的文件保存为 `china_cities_full.json`
   - 放置到项目的 `public/data/` 目录

4. 运行处理脚本（可选）：
   ```bash
   node scripts/process-geojson.js
   ```

### 方法 2：直接使用示例数据

如果只是测试，项目已包含示例数据（仅南京市），可以直接运行：
```bash
npm run dev
```

### 方法 3：使用 GitHub 开源数据

```bash
# 克隆仓库
git clone https://github.com/pyecharts/echarts-china-cities-js.git

# 或者直接下载
# https://github.com/pyecharts/echarts-china-cities-js/tree/master/echarts-china-cities-js
```

## GeoJSON 数据要求

确保您的 GeoJSON 文件包含以下结构：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "南京市",      // 必需：城市名称
        "adcode": "320100"     // 可选：行政区划代码
      },
      "geometry": {
        "type": "Polygon",     // 或 MultiPolygon
        "coordinates": [...]    // 坐标数组
      }
    }
  ]
}
```

## 数据文件大小参考

- **完整中国地级市数据**：约 10-20 MB
- **单个省份数据**：约 500 KB - 2 MB
- **示例数据（项目自带）**：< 1 KB

## 优化建议

如果地图加载缓慢，可以：

1. **使用 Mapshaper 简化**
   - 访问：https://mapshaper.org/
   - 上传 GeoJSON 文件
   - 使用 Simplify 功能减少点数
   - 导出优化后的文件

2. **只保留需要的省份**
   - 编辑 GeoJSON，删除不需要的 features

3. **使用 CDN 托管**
   - 将大文件上传到 CDN
   - 修改代码中的数据 URL
