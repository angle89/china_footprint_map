<template>
  <div class="map-wrapper">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="stats-panel">
        <div class="stats-item">
          <span class="stats-label">已访问城市：</span>
          <span class="stats-value">{{ visitedCities.length }}</span>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-wrapper" ref="searchWrapperRef">
        <div class="search-input-row">
          <span class="search-icon">🔍</span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="搜索城市名称…"
            @input="onSearchInput"
            @keydown.enter="selectFirstResult"
            @keydown.escape="closeDropdown"
            @focus="
              showDropdown = searchQuery.length > 0 && searchResults.length > 0
            "
          />
          <button
            v-if="searchQuery"
            class="search-clear"
            @click="clearSearch"
            title="清除"
          >
            ✕
          </button>
        </div>
        <transition name="dropdown">
          <ul
            v-if="showDropdown && searchResults.length > 0"
            class="search-dropdown"
          >
            <li
              v-for="(city, index) in searchResults"
              :key="city"
              :class="[
                'dropdown-item',
                {
                  'is-visited': isCityVisited(city),
                  'is-active': index === activeIndex,
                },
              ]"
              @mousedown.prevent="selectCity(city)"
              @mouseover="activeIndex = index"
            >
              <span
                class="city-dot"
                :class="{ visited: isCityVisited(city) }"
              ></span>
              {{ city }}
              <span v-if="isCityVisited(city)" class="visited-badge"
                >已访问</span
              >
            </li>
          </ul>
          <div
            v-else-if="showDropdown && searchQuery.length > 0"
            class="search-empty"
          >
            无匹配城市
          </div>
        </transition>
      </div>

      <div class="action-buttons">
        <button
          class="action-button"
          @click="handleExport"
          :disabled="visitedCities.length === 0"
        >
          📤 导出数据
        </button>
        <button
          class="action-button"
          @click="handleExportImage('png')"
          title="导出地图为 PNG"
        >
          🖼️ 导出 PNG
        </button>
        <button
          class="action-button"
          @click="handleExportImage('jpeg')"
          title="导出地图为 JPG"
        >
          📷 导出 JPG
        </button>
        <button
          class="action-button danger"
          @click="showClearConfirm = true"
          :disabled="visitedCities.length === 0"
        >
          🗑️ 清空所有
        </button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="echarts-map"></div>

    <!-- 确认对话框 -->
    <teleport to="body">
      <div
        v-if="showClearConfirm"
        class="dialog-overlay"
        @click="showClearConfirm = false"
      >
        <div class="confirm-dialog" @click.stop>
          <h3 class="dialog-title">⚠️ 确认清空</h3>
          <p class="dialog-message">
            您确定要清空所有已访问的城市记录吗？<br />
            此操作将删除
            <strong>{{ visitedCities.length }}</strong> 条记录，且无法恢复。
          </p>
          <div class="dialog-actions">
            <button class="action-button" @click="showClearConfirm = false">
              取消
            </button>
            <button class="action-button danger" @click="handleClearAll">
              确认清空
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";
import { useFootprint } from "../composables/useFootprint";

const mapContainer = ref(null);
let chartInstance = null;
const showClearConfirm = ref(false);

const {
  visitedCities,
  isCityVisited,
  toggleCity,
  clearAll,
  exportToJSON,
  getStats,
} = useFootprint();

// ───── 城市/省份 数据表 ─────
const allCities = ref([]); // 全部城市名称
const cityProvinceMap = ref({}); // 城市名 → { province, provinceCode }
const provinceLines = ref([]); // 省界折线坐标（lng/lat）

// ───── 搜索功能 ─────
const searchQuery = ref("");
const showDropdown = ref(false);
const activeIndex = ref(-1);
const searchInputRef = ref(null);
const searchWrapperRef = ref(null);

const searchResults = computed(() => {
  const q = searchQuery.value.trim();
  if (!q) return [];
  return allCities.value.filter((name) => name.includes(q)).slice(0, 10);
});

const onSearchInput = () => {
  activeIndex.value = -1;
  showDropdown.value = searchQuery.value.trim().length > 0;
};
const closeDropdown = () => {
  showDropdown.value = false;
  activeIndex.value = -1;
};
const clearSearch = () => {
  searchQuery.value = "";
  showDropdown.value = false;
  searchInputRef.value?.focus();
};

const selectCity = (cityName) => {
  toggleCity(cityName, "");
  searchQuery.value = cityName;
  showDropdown.value = false;
  if (chartInstance) {
    chartInstance.dispatchAction({ type: "geoRoam", geoIndex: 0 });
  }
};
const selectFirstResult = () => {
  const idx = activeIndex.value >= 0 ? activeIndex.value : 0;
  if (searchResults.value[idx]) selectCity(searchResults.value[idx]);
};
const handleOutsideClick = (e) => {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target))
    closeDropdown();
};

// ───── geo.regions 计算 ─────
const getGeoRegions = () => {
  const visitedNames = new Set(visitedCities.value.map((c) => c.name));

  // 有已访问城市的省份
  const litCodes = new Set();
  visitedNames.forEach((name) => {
    const info = cityProvinceMap.value[name];
    if (info) litCodes.add(info.provinceCode);
  });

  const regions = [];
  // 省内未访问 → 极浅黄
  Object.entries(cityProvinceMap.value).forEach(([name, info]) => {
    if (!visitedNames.has(name) && litCodes.has(info.provinceCode)) {
      regions.push({ name, itemStyle: { areaColor: "#FFFBEB" } });
    }
  });
  // 已访问 → 蓝色渐变
  visitedCities.value.forEach((city) => {
    regions.push({
      name: city.name,
      itemStyle: {
        areaColor: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#2A5B8C" },
            { offset: 1, color: "#4A7BA7" },
          ],
        },
        borderColor: "#2A5B8C",
        borderWidth: 0.8,
      },
    });
  });
  return regions;
};

// ───── 导出图片（离屏全图，不受当前缩放平移影响）─────
const handleExportImage = (type) => {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-99999px;top:-99999px;width:1600px;height:1100px;pointer-events:none;";
  document.body.appendChild(container);
  const exportChart = echarts.init(container, null, { renderer: "canvas" });
  exportChart.setOption({
    backgroundColor: "#F4F1EA",
    geo: {
      map: "china_cities",
      roam: false,
      zoom: 1,
      aspectScale: 0.85,
      itemStyle: {
        areaColor: "#FFFFFF",
        borderColor: "#C8C8C8",
        borderWidth: 0.5,
      },
      emphasis: { disabled: true },
      regions: getGeoRegions(),
    },
    series: [
      {
        type: "lines",
        coordinateSystem: "geo",
        geoIndex: 0,
        polyline: true,
        silent: true,
        data: provinceLines.value,
        lineStyle: { color: "#777777", width: 1.8, opacity: 1 },
      },
    ],
  });
  setTimeout(() => {
    const dataURL = exportChart.getDataURL({
      type: type === "jpeg" ? "jpeg" : "png",
      pixelRatio: 2,
      backgroundColor: "#F4F1EA",
    });
    exportChart.dispose();
    document.body.removeChild(container);
    const ext = type === "jpeg" ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `china_footprint_${new Date().toISOString().split("T")[0]}.${ext}`;
    link.click();
  }, 500);
};

// ───── 初始化地图 ─────
const initMap = async () => {
  if (!mapContainer.value) return;
  try {
    const [cityResp, provResp] = await Promise.all([
      fetch("/data/china_cities.json"),
      fetch("/data/china_provinces.json"),
    ]);
    if (!cityResp.ok || !provResp.ok) throw new Error("GeoJSON 加载失败");
    const [cityGeoJson, provGeoJson] = await Promise.all([
      cityResp.json(),
      provResp.json(),
    ]);

    // 城市名称列表
    allCities.value = (cityGeoJson.features || [])
      .map((f) => f.properties?.name)
      .filter(Boolean)
      .sort();

    // 城市→省份映射
    const map = {};
    (cityGeoJson.features || []).forEach((f) => {
      const p = f.properties;
      if (p?.name && p?.provinceCode)
        map[p.name] = {
          province: p.province || "",
          provinceCode: String(p.provinceCode),
        };
    });
    cityProvinceMap.value = map;

    // 从省级 GeoJSON 提取省界折线坐标（lng/lat，供 lines 系列直接使用）
    const lines = [];
    (provGeoJson.features || []).forEach((feature) => {
      const geom = feature.geometry;
      if (!geom) return;
      const polys =
        geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
      polys.forEach((poly) =>
        poly.forEach((ring) => lines.push({ coords: ring })),
      );
    });
    provinceLines.value = lines;

    echarts.registerMap("china_cities", cityGeoJson);
    // china_provinces 不再需要注册，省界线直接用坐标渲染

    chartInstance = echarts.init(mapContainer.value);
    initMapOption();

    // 单个 geo 组件，没有同步问题，不需要 georoam 监听
    chartInstance.on("click", (params) => {
      if (params.componentType === "geo" && params.name) {
        toggleCity(params.name, "");
      }
    });
    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleOutsideClick);
    console.log("✅ 地图初始化成功");
  } catch (error) {
    console.error("❌ 地图初始化失败:", error);
  }
};

// 首次初始化完整配置
const initMapOption = () => {
  if (!chartInstance) return;
  chartInstance.setOption(
    {
      backgroundColor: "#F4F1EA",
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.componentType !== "geo") return "";
          const cityName = params.name;
          const visited = isCityVisited(cityName);
          const cityData = visitedCities.value.find((c) => c.name === cityName);
          const provInfo = cityProvinceMap.value[cityName];
          return `
          <div class="custom-tooltip">
            <h3>${cityName}</h3>
            ${provInfo ? `<p><span class="label">所属省份：</span><span class="value" style="color:#666">${provInfo.province}</span></p>` : ""}
            <p><span class="label">状态：</span>
              <span class="value" style="color:${visited ? "#2A5B8C" : "#999"}">${visited ? "✓ 已访问" : "未访问"}</span></p>
            ${
              visited && cityData
                ? `
              <p><span class="label">访问日期：</span><span class="value">${new Date(cityData.visitDate).toLocaleDateString("zh-CN")}</span></p>
              <p><span class="label">建筑笔记：</span><span class="value">${cityData.notes || "暂无笔记"}</span></p>
            `
                : ""
            }
            <p style="margin-top:8px;color:#999;font-size:12px">💡 点击${visited ? "取消" : "标记"}访问</p>
          </div>`;
        },
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        extraCssText: "box-shadow:none;",
      },
      // 单个 geo 组件，处理城市交互和填色
      geo: {
        map: "china_cities",
        roam: true,
        scaleLimit: { min: 1, max: 5 },
        aspectScale: 0.85,
        itemStyle: {
          areaColor: "#FFFFFF",
          borderColor: "#CCCCCC",
          borderWidth: 0.5,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 11,
            color: "#2A5B8C",
            fontWeight: 600,
          },
          itemStyle: {
            areaColor: "#D6E8F5",
            borderColor: "#2A5B8C",
            borderWidth: 1,
            shadowBlur: 8,
            shadowColor: "rgba(42,91,140,0.25)",
          },
        },
        select: { disabled: true },
        regions: getGeoRegions(),
      },
      series: [
        {
          // 省界线叠加层：共享 geo 坐标系，缩放平移完全同步，无需任何同步逻辑
          type: "lines",
          coordinateSystem: "geo",
          geoIndex: 0,
          polyline: true,
          silent: true,
          zlevel: 2,
          data: provinceLines.value,
          lineStyle: { color: "#777777", width: 1.8, opacity: 0.85 },
        },
      ],
    },
    false,
  );
};

// 仅更新 geo.regions，不重置缩放/平移状态
const updateMapOption = () => {
  if (!chartInstance) return;
  chartInstance.setOption({ geo: { regions: getGeoRegions() } }, false);
};

const handleResize = () => {
  if (chartInstance) chartInstance.resize();
};

// 导出 JSON
const handleExport = () => {
  const jsonData = exportToJSON();
  const stats = getStats();
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `china_footprint_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  alert(`✅ 数据已导出！\n共 ${stats.totalCities} 个城市`);
};

const handleClearAll = () => {
  clearAll();
  showClearConfirm.value = false;
  updateMapOption();
  alert("✅ 已清空所有数据");
};

// 点亮/取消时只更新 regions，不重建地图
watch(
  visitedCities,
  () => {
    updateMapOption();
  },
  { deep: true },
);

onMounted(() => {
  initMap();
});
onUnmounted(() => {
  if (chartInstance) chartInstance.dispose();
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f1ea;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:disabled:hover {
  background: #ffffff;
  color: #2a5b8c;
  border-color: #d0d0d0;
  box-shadow: none;
}

.echarts-map {
  flex: 1;
  width: 100%;
  min-height: 0;
}

/* ───── 搜索框 ───── */
.search-wrapper {
  position: relative;
  flex: 0 0 260px;
}
.search-input-row {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  padding: 0 10px;
  height: 38px;
  transition: border-color 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.search-input-row:focus-within {
  border-color: #2a5b8c;
  box-shadow: 0 0 0 3px rgba(42, 91, 140, 0.12);
}
.search-icon {
  font-size: 14px;
  margin-right: 6px;
  opacity: 0.6;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
  color: #333;
}
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #999;
  padding: 0 2px;
}
.search-clear:hover {
  color: #555;
}
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 999;
  max-height: 260px;
  overflow-y: auto;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.15s;
}
.dropdown-item:hover,
.dropdown-item.is-active {
  background: #eef4fb;
}
.city-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0d0d0;
  flex-shrink: 0;
  transition: background 0.2s;
}
.city-dot.visited {
  background: #2a5b8c;
}
.visited-badge {
  margin-left: auto;
  font-size: 11px;
  color: #2a5b8c;
  background: rgba(42, 91, 140, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
}
.search-empty {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  font-size: 13px;
  color: #999;
  z-index: 999;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .control-bar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 20px;
  }
  .search-wrapper {
    flex: 1 1 200px;
    min-width: 160px;
  }
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  .action-button {
    flex: 1;
    min-width: 80px;
  }
}
</style>
