<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">中国城市足迹地图</h1>
          <p class="app-subtitle">China Footprint Map — Architectural Aesthetic</p>
        </div>
        <div class="author-section">
          <span class="author-name">Designed by Zehao CHEN</span>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <ChinaMap />
    </main>

    <footer class="app-footer">
      <p>Built with ❤️ by an architect who codes | © 2026 Zehao Chen</p>
    </footer>
  </div>
</template>

<script setup>
import ChinaMap from './components/ChinaMap.vue'
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F4F1EA;
}

.app-header {
  background: linear-gradient(135deg, #2A5B8C 0%, #4A7BA7 100%);
  color: white;
  padding: 16px 40px;
  box-shadow: 0 2px 12px rgba(42, 91, 140, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

.app-subtitle {
  font-size: 12px;
  font-weight: 300;
  opacity: 0.9;
  margin: 0;
  letter-spacing: 1px;
}

.author-section {
  display: flex;
  align-items: center;
}

.author-name {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.95;
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.app-footer {
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #D0D0D0;
  padding: 12px 40px;
  text-align: center;
}

.app-footer p {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 12px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .app-title {
    font-size: 20px;
  }

  .app-subtitle {
    font-size: 11px;
  }

  .app-footer {
    padding: 10px 20px;
  }

  .app-footer p {
    font-size: 11px;
  }
}
</style>
