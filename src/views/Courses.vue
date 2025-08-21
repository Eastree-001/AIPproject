<template>
  <div class="courses-page">
    <Header />
    <main class="main-content">
      <div class="container">
        <h1>课程学习</h1>
        <p>课程页面正在开发中...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding-top: 80px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

p {
  font-size: 1.2rem;
  color: #666;
}
</style>
