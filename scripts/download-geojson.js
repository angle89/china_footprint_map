/**
 * 自动下载中国地级市 GeoJSON 数据
 * 数据来源：阿里云 DataV.GeoAtlas
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据源 URL（阿里云 DataV 提供的公开 API）
const GEO_JSON_URLS = {
  // 中国地级市完整数据（从 DataV CDN）
  cities: 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  // 备用源
  backup: 'https://raw.githubusercontent.com/pyecharts/pyecharts-assets/master/assets/maps/china.json'
};

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'china_cities.json');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 下载文件
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 正在从以下地址下载数据...\n   ${url}\n`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        file.close();
        fs.unlinkSync(outputPath);
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      let lastPercent = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.floor((downloadedSize / totalSize) * 100);
        
        if (percent > lastPercent && percent % 10 === 0) {
          process.stdout.write(`\r📊 下载进度: ${percent}%`);
          lastPercent = percent;
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ 下载完成！\n');
        resolve(outputPath);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

// 验证 GeoJSON 格式
function validateGeoJSON(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.type !== 'FeatureCollection') {
      throw new Error('不是有效的 FeatureCollection');
    }
    
    if (!Array.isArray(data.features) || data.features.length === 0) {
      throw new Error('features 数组为空');
    }
    
    console.log(`✅ 数据验证通过！`);
    console.log(`   - 类型: ${data.type}`);
    console.log(`   - 要素数量: ${data.features.length}`);
    
    // 统计城市名称
    const cityNames = data.features
      .map(f => f.properties?.name)
      .filter(Boolean)
      .slice(0, 10);
    
    console.log(`   - 示例城市: ${cityNames.join('、')}...`);
    
    return true;
  } catch (error) {
    console.error(`❌ 数据验证失败: ${error.message}`);
    return false;
  }
}

// 优化 GeoJSON 数据（添加必要字段）
function optimizeGeoJSON(filePath) {
  try {
    console.log('\n🔄 正在优化数据格式...');
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // 确保每个 feature 都有必要的属性
    data.features = data.features.map((feature, index) => {
      if (!feature.properties) {
        feature.properties = {};
      }
      
      // 确保有 name 字段
      if (!feature.properties.name && feature.properties.NAME) {
        feature.properties.name = feature.properties.NAME;
      }
      
      // 确保有 adcode 字段
      if (!feature.properties.adcode && feature.properties.adcode) {
        feature.properties.adcode = feature.properties.adcode;
      } else if (!feature.properties.adcode) {
        feature.properties.adcode = `${100000 + index}`;
      }
      
      return feature;
    });
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log('✅ 数据优化完成！\n');
    return true;
  } catch (error) {
    console.error(`❌ 数据优化失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始下载中国地级市 GeoJSON 数据\n');
  console.log('━'.repeat(60));
  
  try {
    // 尝试主数据源
    let success = false;
    let filePath = OUTPUT_FILE;
    
    for (const [name, url] of Object.entries(GEO_JSON_URLS)) {
      try {
        console.log(`\n📍 尝试数据源: ${name}`);
        await downloadFile(url, filePath);
        
        // 验证下载的文件
        if (validateGeoJSON(filePath)) {
          // 优化数据
          optimizeGeoJSON(filePath);
          success = true;
          break;
        } else {
          console.log(`⚠️  ${name} 数据源验证失败，尝试下一个...\n`);
        }
      } catch (error) {
        console.error(`❌ ${name} 数据源下载失败: ${error.message}`);
        console.log('⚠️  尝试下一个数据源...\n');
      }
    }
    
    if (success) {
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log('━'.repeat(60));
      console.log('\n🎉 恭喜！GeoJSON 数据下载并配置成功！\n');
      console.log(`📄 文件位置: ${filePath}`);
      console.log(`📦 文件大小: ${sizeInMB} MB`);
      console.log('\n✅ 您现在可以启动项目了：');
      console.log('   npm run dev\n');
      console.log('💡 提示：刷新浏览器即可看到完整的中国地图！\n');
    } else {
      throw new Error('所有数据源都下载失败');
    }
    
  } catch (error) {
    console.error('\n❌ 下载失败:', error.message);
    console.log('\n📝 手动下载方法：');
    console.log('   1. 访问: http://datav.aliyun.com/portal/school/atlas/area_selector');
    console.log('   2. 选择「中华人民共和国」→「全国」→「地级市」');
    console.log('   3. 点击「下载 JSON」');
    console.log(`   4. 将文件保存为: ${OUTPUT_FILE}\n`);
    process.exit(1);
  }
}

// 运行
main();
