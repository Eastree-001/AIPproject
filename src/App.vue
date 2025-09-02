<template>
  <div id="app-container" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// 根组件，只负责路由视图
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background: #ffffff;
  
}

/* 全局缩放到80% */
#app-container.app-container {
  zoom: 0.75;
  width: 100%;
  min-height: 100vh;
}

/* 确保html和body不产生额外空间 */
html {
  height: 100%;
 
}

/* 全局样式 */
.el-button--primary {
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 500;
}

.el-input__inner {
  border-radius: 25px;
}

.el-card {
  border-radius: 20px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.fade-in-left {
  animation: fadeInLeft 0.6s ease-out forwards;
}
</style>