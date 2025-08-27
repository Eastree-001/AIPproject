const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Coze API测试脚本
async function testCozeAPI() {
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;
  
  console.log('🤖 Coze API连接测试开始...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未配置');
  console.log('Bot ID:', botId || '未配置');
  
  if (!apiKey || !botId) {
    console.error('❌ 缺少必要的配置信息');
    return;
  }
  
  try {
    // 测试API连接
    const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: `test_${Date.now()}`,
        bot_id: botId,
        user: 'test_user',
        query: '你好，请介绍一下自己',
        stream: false
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.code === 0) {
      console.log('✅ Coze API连接成功！');
      console.log('📝 AI回复:', result.data?.messages?.[0]?.content?.substring(0, 100) + '...' || '无回复内容');
      console.log('🎯 对话ID:', result.data?.conversation_id || '未知');
      return true;
    } else {
      console.error('❌ Coze API调用失败:');
      console.error('状态码:', response.status);
      console.error('响应:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 网络请求失败:', error.message);
    return false;
  }
}

// 执行测试
testCozeAPI().then(success => {
  if (success) {
    console.log('\n🚀 恭喜！AI导师工作流已准备就绪');
    console.log('💡 下一步: 启动n8n并导入工作流文件');
    console.log('   1. 运行: npm run n8n:dev');
    console.log('   2. 访问: http://localhost:5678');
    console.log('   3. 导入: n8n-workflows/ai-tutor/ 目录下的工作流');
  } else {
    console.log('\n❌ 请检查配置后重试');
  }
  process.exit(success ? 0 : 1);
});