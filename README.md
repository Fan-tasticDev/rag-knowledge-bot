# 📚 RAG 知识库问答系统（AI 全栈项目）

> 基于 Next.js + FastAPI + 智谱 GLM-4-Flash 的智能文档问答助手。  
> 已实现 PDF 上传、自动分块、向量存储、检索增强生成（RAG）全链路。

## ✅ 当前进展

- [x] 前端 Next.js 对话界面（流式展示）
- [x] 后端 FastAPI 接入智谱大模型
- [x] 前后端联调成功
- [x] 文档上传解析（PDF 文本提取）
- [x] 文本分块（RecursiveCharacterTextSplitter）
- [x] 向量嵌入（智谱 embedding-2）
- [x] 向量数据库存储与检索（Chroma）
- [x] RAG 问答：检索 + 增强 + 生成
- [x] 修复 LLM 重复输出与特殊字符编码问题
- [ ] 多智能体协作看板（下一项目）

## 🛠 技术栈

| 分层 | 技术 |
|------|------|
| 前端 | Next.js (App Router), TypeScript, Tailwind CSS |
| 后端 | Python, FastAPI, Pydantic |
| AI 模型 | 智谱 GLM-4-Flash (对话), embedding-2 (嵌入) |
| 向量数据库 | Chroma（本地持久化） |
| 文本处理 | PyPDF, RecursiveCharacterTextSplitter |
| 部署 | 前端：Vercel / 后端：可部署至 Railway 等 |

## 📂 项目结构

rag-knowledge-bot/
├── backend/
│ ├── main.py # FastAPI 后端主程序
│ ├── chroma_db/ # 向量数据库文件（不提交）
│ ├── .env # API Key（不提交）
│ └── venv/ # Python 虚拟环境
├── frontend/
│ ├── app/
│ │ └── page.tsx # 对话界面与 PDF 上传
│ └── package.json
├── .gitignore
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

📝 下一步计划
多智能体协作看板（Agent + Task Planning）

前端流式回答体验优化

部署上线（Vercel + Railway）

### 📬 联系我
如果你对这个项目感兴趣，欢迎通过 GitHub 或邮件与我交流，期待合作机会。

