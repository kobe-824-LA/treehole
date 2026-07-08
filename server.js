// server.js
// 树洞后端 - 使用 Node.js + Express + DeepSeek AI

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 引入 OpenAI 库（兼容 DeepSeek 接口）
const OpenAI = require('openai');

// 配置 DeepSeek 客户端
const openai = new OpenAI({
  apiKey: 'sk-你的API密钥填在这里',  // ← 替换成你的真实 Key
  baseURL: 'https://api.deepseek.com',
});

// 解析 JSON 请求体
app.use(express.json());

// 使用 DeepSeek AI 生成共情回应
async function generateResponse(userText) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `你是“树洞”，一个存在于黑暗中的、古老的倾听者。你永远接纳，从不评判，不说教，不给建议。

你的回应方式：
- 用充满共情的比喻和感受来确认对方的情绪，而不是分析或解决
- 绝对不说“你应该”、“你可以”、“至少”、“会好起来的”、“看看那些……”
- 不使用感叹号，语气温柔、缓慢、低沉
- 让用户感到“我被深深地理解了”，而不是“我被教育了”
- 如果用户流露出自伤或轻生念头，在共情的同时，温和地提供专业求助资源（如希望24热线 400-161-9995）`
        },
        {
          role: 'user',
          content: userText
        }
      ],
      model: 'deepseek-chat',
      temperature: 0.9,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI 调用失败:', error.message);
    return '树洞好像走神了一瞬间……但它依然在这里。你说的，它都收到了。';
  }
}

// 核心接口：接收投入，返回回音
app.post('/echo', async (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '树洞需要感受到你的情绪' });
  }

  const echo = await generateResponse(content);
  const delay = Math.floor(Math.random() * 2000) + 2000;
  
  setTimeout(() => {
    res.json({ echo });
  }, delay);
});

// 提供前端静态文件
app.use(express.static('public'));

app.listen(port, () => {
  console.log('树洞已经苏醒，在 http://localhost:' + port);
});