# RAG 知识库问答系统（AI 全栈项目）

> 当前阶段：前后端对话链路已跑通，正在集成文档上传与 RAG 核心。

## 🚀 项目简介

基于 Next.js + FastAPI + SiliconFlow 大模型的智能问答应用。  
目标是构建一个能够上传文档、实现检索增强生成（RAG）的知识库助手。

## ✅ 当前进展

- [x] 前端 Next.js 对话界面
- [x] 后端 FastAPI 接入 SiliconFlow 大模型
- [x] 前后端联调成功，支持流式对话

## 🛠 技术栈

| 分层 | 技术 |
|------|------|
| 前端 | Next.js (App Router), TypeScript, Tailwind CSS |
| 后端 | Python, FastAPI, Pydantic |
| AI 模型 | SiliconFlow API (Qwen2.5-7B-Instruct) |
| 向量数据库 | Chroma（即将集成） |
| LLM 框架 | LangChain.js（即将集成） |
| 部署 | Vercel (前端) / Railway (后端) |

## 📂 项目结构
rag-knowledge-bot/
├── backend/ # FastAPI 后端
│ ├── main.py
│ └── .env # 环境变量（不提交）
├── frontend/ # Next.js 前端
│ ├── app/
│ └── package.json
└── README.md


## 🧑‍💻 本地运行

### 1. 克隆项目
```bash
git clone https://github.com/Fan-tasticDev/rag-knowledge-bot.git
cd rag-knowledge-bot
```
### 2.后端配置
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install fastapi uvicorn openai python-dotenv pydantic
```
创建 .env 文件，填入你的 SiliconFlow API Key：
```text
SILICON_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```
启动后端：

```bash
uvicorn main:app --reload
```
访问 http://127.0.0.1:8000/docs 测试接口。

### 3. 前端启动
```bash
cd ../frontend
npm install
npm run dev
```
打开 http://localhost:3000，在对话框中输入消息，即可与 AI 对话。

📝 下一步计划
- 文档上传解析（PDF / Markdown）

- 文本分块与向量嵌入

- 接入 Chroma 向量数据库

- 实现 RAG 问答：检索 → 增强 → 生成

- 前端流式回答与引用高亮

### 📬 联系我
如果你对这个项目感兴趣，欢迎通过 GitHub 或邮件与我交流，期待合作机会。

