# 📚 RAG 知识库智能问答系统

> 基于 Next.js + FastAPI + 智谱 GLM-4-Flash 的智能文档问答助手。  
> 已实现 PDF 上传、自动分块、向量存储、检索增强生成（RAG）全链路。

## ✨ 核心功能

- 📄 **文档上传与解析**：支持 PDF 上传，自动提取文本并清洗特殊字符
- 🧠 **智能问答**：基于文档内容的精准问答，非简单关键词匹配
- 📖 **原文溯源**：回答附带检索到的文档片段，确保可解释性
- ⚡ **流式响应**：采用 SSE 实现打字机效果，优化等待体验
- 🔧 **工程化处理**：解决 LLM 重复输出、Emoji 编码异常等实际问题

## 🛠 技术栈

| 层级 | 技术选型 |
|------|----------|
| **前端** | Next.js (App Router) · TypeScript · Tailwind CSS |
| **后端** | Python · FastAPI · Pydantic |
| **大模型** | 智谱 GLM-4-Flash（对话）· embedding-2（文本嵌入） |
| **向量数据库** | Chroma（本地持久化 + 云端部署） |
| **文本处理** | PyPDF · RecursiveCharacterTextSplitter |
| **部署** | Vercel（前端）· Render（后端） |

## 📂 项目结构
```text
rag-knowledge-bot/
├── backend/
│ ├── main.py # FastAPI 后端主程序（含 /upload, /rag-chat, /rag-chat-stream 接口）
│ ├── chroma_db/ # 向量数据库文件（自动生成，不提交）
| ├── requirements.txt # Python 依赖
│ ├── .env # API Key（不提交）
│ └── venv/ # Python 虚拟环境
├── frontend/
│ ├── app/
│ │ └── page.tsx # 对话界面与 PDF 上传
│ └── package.json
├── .gitignore
└── README.md
```

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
pip install -r requirements.txt
pip install fastapi uvicorn openai python-dotenv pydantic chromadb pypdf langchain-text-splitters
```
创建 .env 文件，填入你的智谱 API Key：
```text
ZHIPU_API_KEY=你的智谱Key
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

## 🌐 在线演示
[点击这里查看在线演示](https://rag-knowledge-bot.vercel.app/)
[在线演示地址2](https://rag-knowledge-bot-bkkgmolp.edgeone.cool/)

### 📝 下一步计划
多智能体协作看板（Agent + Task Planning）

前端流式回答体验优化



### 📬 联系我
如果你对这个项目感兴趣，欢迎通过 GitHub 或邮件与我交流，期待合作机会。

