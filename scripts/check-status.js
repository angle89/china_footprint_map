/**
 * 项目状态检查脚本
 * 检查项目是否已准备好运行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 检查项目状态...\n');
console.log('═'.repeat(60));

let allGood = true;

// 1. 检查 Node.js 版本
console.log('\n📦 1. Node.js 环境');
const nodeVersion = process.version;
console.log(`   版本: ${nodeVersion}`);
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 16) {
  console.log('   ✅ 版本符合要求 (>= 16.x)');
} else {
  console.log('   ❌ 版本过低，请升级到 16.x 或更高版本');
  allGood = false;
}

// 2. 检查 package.json
console.log('\n📄 2. 项目配置');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ package.json 存在');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  console.log(`   项目名: ${pkg.name}`);
  console.log(`   版本: ${pkg.version}`);
} else {
  console.log('   ❌ package.json 不存在');
  allGood = false;
}

// 3. 检查依赖安装
console.log('\n📚 3. 依赖安装');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules 存在');
  
  // 检查关键依赖
  const criticalDeps = ['vue', 'echarts', 'vite'];
  let depsOk = true;
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep} 已安装`);
    } else {
      console.log(`   ❌ ${dep} 未安装`);
      depsOk = false;
    }
  });
  
  if (!depsOk) {
    console.log('\n   💡 运行: npm install');
    allGood = false;
  }
} else {
  console.log('   ❌ node_modules 不存在');
  console.log('   💡 运行: npm install');
  allGood = false;
}

// 4. 检查源代码
console.log('\n💻 4. 源代码');
const criticalFiles = [
  'src/main.js',
  'src/App.vue',
  'src/components/ChinaMap.vue',
  'src/composables/useFootprint.js',
  'index.html',
  'vite.config.js'
];

let filesOk = true;
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} 缺失`);
    filesOk = false;
  }
});

if (!filesOk) {
  allGood = false;
}

// 5. 检查地图数据
console.log('\n🗺️  5. 地图数据');
const dataPath = path.join(__dirname, '..', 'public', 'data', 'china_cities.json');
if (fs.existsSync(dataPath)) {
  const stats = fs.statSync(dataPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   ✅ china_cities.json 存在`);
  console.log(`   📦 文件大小: ${sizeInMB} MB`);
  
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      console.log(`   ✅ GeoJSON 格式正确`);
      console.log(`   🏙️  城市数量: ${data.features.length}`);
      
      if (data.features.length < 10) {
        console.log('   ⚠️  城市数量较少，可能是示例数据');
        console.log('   💡 运行: node scripts/download-cities-detailed.js');
      }
    } else {
      console.log('   ❌ GeoJSON 格式错误');
      allGood = false;
    }
  } catch (error) {
    console.log('   ❌ JSON 解析失败');
    allGood = false;
  }
} else {
  console.log('   ❌ china_cities.json 不存在');
  console.log('   💡 运行: node scripts/download-cities-detailed.js');
  allGood = false;
}

// 6. 检查配置文件
console.log('\n⚙️  6. 配置文件');
const configFiles = [
  'tailwind.config.js',
  'postcss.config.js',
  'vite.config.js'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} 缺失`);
    allGood = false;
  }
});

// 7. 检查启动脚本
console.log('\n🚀 7. 启动脚本');
const startScripts = ['start.bat', 'start.sh'];
startScripts.forEach(script => {
  const scriptPath = path.join(__dirname, '..', script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ⚠️  ${script} 不存在（可选）`);
  }
});

// 总结
console.log('\n' + '═'.repeat(60));
console.log('\n📊 检查结果:\n');

if (allGood) {
  console.log('   🎉 所有检查通过！项目已准备就绪！\n');
  console.log('   ▶️  启动项目:\n');
  console.log('      方法 1: npm run dev');
  console.log('      方法 2: start.bat (Windows)');
  console.log('      方法 3: ./start.sh (Mac/Linux)\n');
} else {
  console.log('   ⚠️  发现一些问题，请按照上面的提示修复\n');
  console.log('   🔧 常见修复命令:\n');
  console.log('      npm install                              # 安装依赖');
  console.log('      node scripts/download-cities-detailed.js # 下载地图数据\n');
}

console.log('═'.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);
