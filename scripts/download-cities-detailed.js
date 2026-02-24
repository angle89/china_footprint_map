/**
 * 下载详细的中国地级市数据
 * 包含所有地级市的边界信息
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'china_cities.json');

// 中国主要省份的 adcode（用于获取地级市数据）
const PROVINCE_CODES = {
  '110000': '北京市',
  '120000': '天津市',
  '130000': '河北省',
  '140000': '山西省',
  '150000': '内蒙古自治区',
  '210000': '辽宁省',
  '220000': '吉林省',
  '230000': '黑龙江省',
  '310000': '上海市',
  '320000': '江苏省',
  '330000': '浙江省',
  '340000': '安徽省',
  '350000': '福建省',
  '360000': '江西省',
  '370000': '山东省',
  '410000': '河南省',
  '420000': '湖北省',
  '430000': '湖南省',
  '440000': '广东省',
  '450000': '广西壮族自治区',
  '460000': '海南省',
  '500000': '重庆市',
  '510000': '四川省',
  '520000': '贵州省',
  '530000': '云南省',
  '540000': '西藏自治区',
  '610000': '陕西省',
  '620000': '甘肃省',
  '630000': '青海省',
  '640000': '宁夏回族自治区',
  '650000': '新疆维吾尔自治区',
  '710000': '台湾省',
  '810000': '香港特别行政区',
  '820000': '澳门特别行政区'
};

// 下载单个省份的地级市数据
function downloadProvinceData(adcode, name) {
  return new Promise((resolve, reject) => {
    const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`${name} 下载失败: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`${name} JSON 解析失败`));
        }
      });
    }).on('error', reject);
  });
}

// 合并所有省份的地级市数据
async function downloadAllCities() {
  console.log('🚀 开始下载中国所有省份的地级市数据\n');
  console.log('━'.repeat(60));
  
  const allFeatures = [];
  let successCount = 0;
  let failCount = 0;
  
  const provinces = Object.entries(PROVINCE_CODES);
  
  for (let i = 0; i < provinces.length; i++) {
    const [adcode, name] = provinces[i];
    const progress = `[${i + 1}/${provinces.length}]`;
    
    try {
      process.stdout.write(`\r${progress} 📥 正在下载: ${name.padEnd(20)} `);
      
      const data = await downloadProvinceData(adcode, name);
      
      if (data.features && Array.isArray(data.features)) {
        // 为每个 feature 添加省份信息
        data.features.forEach(feature => {
          if (feature.properties) {
            feature.properties.province = name;
            feature.properties.provinceCode = adcode;
          }
          allFeatures.push(feature);
        });
        
        process.stdout.write(`✅ (+${data.features.length} 个城市)\n`);
        successCount++;
      }
      
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      process.stdout.write(`❌ 失败\n`);
      failCount++;
    }
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 下载统计:`);
  console.log(`   ✅ 成功: ${successCount} 个省份`);
  console.log(`   ❌ 失败: ${failCount} 个省份`);
  console.log(`   🏙️  总计: ${allFeatures.length} 个地级市\n`);
  
  return allFeatures;
}

// 主函数
async function main() {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // 下载所有城市数据
    const features = await downloadAllCities();
    
    if (features.length === 0) {
      throw new Error('没有下载到任何数据');
    }
    
    // 创建 GeoJSON 对象
    const geoJSON = {
      type: 'FeatureCollection',
      features: features
    };
    
    // 保存文件
    console.log('💾 正在保存数据...\n');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geoJSON, null, 2), 'utf-8');
    
    const stats = fs.statSync(OUTPUT_FILE);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('━'.repeat(60));
    console.log('\n🎉 恭喜！完整的地级市数据下载成功！\n');
    console.log(`📄 文件位置: ${OUTPUT_FILE}`);
    console.log(`📦 文件大小: ${sizeInMB} MB`);
    console.log(`🏙️  城市数量: ${features.length}`);
    
    // 显示示例城市
    const sampleCities = features
      .slice(0, 10)
      .map(f => f.properties?.name)
      .filter(Boolean);
    console.log(`📍 示例城市: ${sampleCities.join('、')}...\n`);
    
    console.log('✅ 您现在可以：');
    console.log('   1. 刷新浏览器（http://localhost:3000）');
    console.log('   2. 看到完整的中国地级市地图');
    console.log('   3. 点击任意城市开始记录足迹！\n');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 备选方案：');
    console.log('   当前已下载的省级数据也可以使用');
    console.log('   如需地级市数据，请访问：');
    console.log('   http://datav.aliyun.com/portal/school/atlas/area_selector\n');
    process.exit(1);
  }
}

// 运行
main();
