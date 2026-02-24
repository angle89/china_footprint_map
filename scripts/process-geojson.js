/**
 * 中国城市地图数据下载脚本
 * 
 * 使用说明：
 * 1. 从阿里云 DataV 下载完整 GeoJSON 数据
 * 2. 将数据保存为 china_cities_full.json
 * 3. 运行此脚本进行数据验证和处理
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = './public/data';
const INPUT_FILE = path.join(DATA_DIR, 'china_cities_full.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'china_cities.json');

// 验证 GeoJSON 格式
function validateGeoJSON(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format');
  }
  
  if (data.type !== 'FeatureCollection') {
    throw new Error('Root type must be "FeatureCollection"');
  }
  
  if (!Array.isArray(data.features)) {
    throw new Error('Missing "features" array');
  }
  
  // 验证每个 feature
  data.features.forEach((feature, index) => {
    if (feature.type !== 'Feature') {
      console.warn(`Warning: Feature ${index} has invalid type`);
    }
    
    if (!feature.properties || !feature.properties.name) {
      console.warn(`Warning: Feature ${index} missing name property`);
    }
    
    if (!feature.geometry) {
      console.warn(`Warning: Feature ${index} missing geometry`);
    }
  });
  
  return true;
}

// 处理和优化 GeoJSON 数据
function processGeoJSON(data) {
  console.log(`📊 Original features count: ${data.features.length}`);
  
  // 确保每个城市都有 adcode
  data.features = data.features.map(feature => {
    if (!feature.properties.adcode && feature.properties.name) {
      // 尝试从其他字段提取
      feature.properties.adcode = feature.properties.code || 
                                   feature.properties.id || 
                                   '';
    }
    return feature;
  });
  
  // 按名称排序
  data.features.sort((a, b) => {
    return (a.properties.name || '').localeCompare(b.properties.name || '', 'zh-CN');
  });
  
  console.log(`✅ Processed features count: ${data.features.length}`);
  
  return data;
}

// 生成统计信息
function generateStats(data) {
  const cities = data.features.map(f => f.properties.name).filter(Boolean);
  const provinces = new Set(
    data.features
      .map(f => f.properties.adcode?.substring(0, 2))
      .filter(Boolean)
  );
  
  return {
    totalCities: cities.length,
    totalProvinces: provinces.size,
    cities: cities,
  };
}

// 主函数
function main() {
  console.log('🚀 Starting GeoJSON data processing...\n');
  
  // 检查输入文件
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.log('\n📥 Please download the GeoJSON data from:');
    console.log('   http://datav.aliyun.com/portal/school/atlas/area_selector');
    console.log('\n📝 Steps:');
    console.log('   1. Select "中华人民共和国"');
    console.log('   2. Choose "全国" → "地级市"');
    console.log('   3. Download JSON');
    console.log(`   4. Save as: ${INPUT_FILE}`);
    console.log('   5. Run this script again\n');
    return;
  }
  
  try {
    // 读取数据
    console.log(`📖 Reading file: ${INPUT_FILE}`);
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const data = JSON.parse(rawData);
    
    // 验证数据
    console.log('✓ Validating GeoJSON format...');
    validateGeoJSON(data);
    console.log('✅ Validation passed!\n');
    
    // 处理数据
    console.log('🔄 Processing data...');
    const processedData = processGeoJSON(data);
    
    // 生成统计
    const stats = generateStats(processedData);
    console.log('\n📊 Statistics:');
    console.log(`   - Total Cities: ${stats.totalCities}`);
    console.log(`   - Total Provinces: ${stats.totalProvinces}`);
    
    // 写入输出文件
    console.log(`\n💾 Writing to: ${OUTPUT_FILE}`);
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(processedData, null, 2),
      'utf-8'
    );
    
    // 写入统计文件
    const statsFile = path.join(DATA_DIR, 'cities_list.json');
    fs.writeFileSync(
      statsFile,
      JSON.stringify(stats, null, 2),
      'utf-8'
    );
    
    console.log('✅ Processing completed successfully!');
    console.log(`\n📄 Files generated:`);
    console.log(`   - ${OUTPUT_FILE}`);
    console.log(`   - ${statsFile}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// 运行
main();
