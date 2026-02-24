import { ref, watch } from 'vue'

const STORAGE_KEY = 'china_footprint_data'

export function useFootprint() {
  // 响应式状态：已访问的城市列表
  const visitedCities = ref([])
  
  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        visitedCities.value = data.visitedCities || []
        console.log('✅ 已从本地存储加载数据:', visitedCities.value.length, '个城市')
      }
    } catch (error) {
      console.error('❌ 加载本地数据失败:', error)
      visitedCities.value = []
    }
  }

  // 保存到 localStorage
  const saveToStorage = () => {
    try {
      const data = {
        visitedCities: visitedCities.value,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('💾 数据已保存到本地存储')
    } catch (error) {
      console.error('❌ 保存数据失败:', error)
    }
  }

  // 检查城市是否已访问
  const isCityVisited = (cityName) => {
    return visitedCities.value.some(city => city.name === cityName)
  }

  // 切换城市访问状态
  const toggleCity = (cityName, adcode = '') => {
    const index = visitedCities.value.findIndex(city => city.name === cityName)
    
    if (index > -1) {
      // 城市已存在，移除它
      visitedCities.value.splice(index, 1)
      console.log('🗑️  移除城市:', cityName)
    } else {
      // 城市不存在，添加它
      const newCity = {
        name: cityName,
        adcode: adcode,
        visitDate: new Date().toISOString(),
        notes: ''
      }
      visitedCities.value.push(newCity)
      console.log('✨ 添加城市:', cityName)
    }
    
    saveToStorage()
  }

  // 添加城市（带完整信息）
  const addCity = (cityData) => {
    const exists = visitedCities.value.some(city => city.name === cityData.name)
    if (!exists) {
      visitedCities.value.push({
        name: cityData.name,
        adcode: cityData.adcode || '',
        visitDate: cityData.visitDate || new Date().toISOString(),
        notes: cityData.notes || ''
      })
      saveToStorage()
    }
  }

  // 更新城市笔记
  const updateCityNotes = (cityName, notes) => {
    const city = visitedCities.value.find(c => c.name === cityName)
    if (city) {
      city.notes = notes
      saveToStorage()
      console.log('📝 更新笔记:', cityName)
    }
  }

  // 清空所有数据
  const clearAll = () => {
    visitedCities.value = []
    saveToStorage()
    console.log('🧹 已清空所有数据')
  }

  // 导出数据为 JSON
  const exportToJSON = () => {
    const data = {
      visitedCities: visitedCities.value,
      exportDate: new Date().toISOString(),
      totalCities: visitedCities.value.length
    }
    return JSON.stringify(data, null, 2)
  }

  // 导出数据为 CSV
  const exportToCSV = () => {
    const headers = ['城市名称', '行政区划代码', '访问日期', '建筑笔记']
    const rows = visitedCities.value.map(city => [
      city.name,
      city.adcode,
      new Date(city.visitDate).toLocaleDateString('zh-CN'),
      city.notes || '无'
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    return csv
  }

  // 获取统计信息
  const getStats = () => {
    return {
      totalCities: visitedCities.value.length,
      provinces: new Set(visitedCities.value.map(c => c.adcode.substring(0, 2))).size,
      latestVisit: visitedCities.value.length > 0 
        ? visitedCities.value.reduce((latest, city) => 
            new Date(city.visitDate) > new Date(latest.visitDate) ? city : latest
          ).name
        : '无'
    }
  }

  // 初始化时加载数据
  loadFromStorage()

  // 监听数据变化（用于调试）
  watch(visitedCities, (newVal) => {
    console.log('📊 当前已访问城市数:', newVal.length)
  }, { deep: true })

  return {
    visitedCities,
    isCityVisited,
    toggleCity,
    addCity,
    updateCityNotes,
    clearAll,
    exportToJSON,
    exportToCSV,
    getStats,
    loadFromStorage,
    saveToStorage
  }
}
