from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import re

# RAG 相关
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("ZHIPU_API_KEY"),
    base_url="https://open.bigmodel.cn/api/paas/v4/"
)

class RagChatResponse(BaseModel):
    reply: str
    sources: list[str] = []

# ---------- Chroma 初始化 ----------
CHROMA_PATH = "./chroma_db"
collection = None

def init_chroma():
    global collection
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection(name="knowledge_base")

@app.on_event("startup")
def startup_event():
    init_chroma()

# ---------- 嵌入函数 (使用 SiliconFlow 的嵌入模型) ----------
def get_embedding(text: str) -> list:
    resp = client.embeddings.create(
        model="embedding-2" ,  # 中文嵌入模型，SiliconFlow 支持
        input=text
    )
    return resp.data[0].embedding

# ---------- 文本分块 ----------
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    separators=["\n\n", "\n", "。", "！", "？", "；", "，", " ", ""]
)

def process_pdf(file) -> list[str]:
    reader = PdfReader(file.file)
    full_text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"
    # 清理无效 Unicode 代理对（修复 emoji 等字符导致的编码错误）
    full_text = re.sub(r'[\ud800-\udfff]', '', full_text)
    # 也可再过滤掉其他可能的非基本字符（可选）
    # full_text = full_text.encode('utf-8', 'ignore').decode('utf-8')
    return text_splitter.split_text(full_text)

# ---------- Pydantic 模型 ----------
class ChatRequest(BaseModel):
    message: str

class RagChatRequest(BaseModel):
    message: str

# ---------- 普通对话接口 (保留) ----------
@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="glm-4-flash" ,
            messages=[{"role": "user", "content": req.message}],
            stream=False
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

# ---------- 文件上传接口 ----------
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        chunks = process_pdf(file)
        if not chunks:
            return {"error": "未能从文件中提取文字"}
        # 生成嵌入并存入 Chroma
        ids = [f"{file.filename}_{i}" for i in range(len(chunks))]
        embeddings = [get_embedding(chunk) for chunk in chunks]
        metadatas = [{"source": file.filename, "chunk_index": i} for i in range(len(chunks))]
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )
        return {"message": f"成功处理 {len(chunks)} 个文本块"}
    except Exception as e:
        return {"error": str(e)}


# ---------- RAG 问答接口 ----------
@app.post("/rag-chat", response_model=RagChatResponse)
async def rag_chat(req: RagChatRequest):
    try:
        # 1. 将用户问题向量化
        query_embedding = get_embedding(req.message)
        # 2. 从 Chroma 检索最相关的 3 个块
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=6
        )
        retrieved_docs = results.get("documents", [[]])[0]
        if not retrieved_docs:
            return {"reply": "知识库中没有找到相关信息。"}

        # 简单重排
        def simple_rerank(query: str, docs: list[str]) -> list[str]:
            query_set = set(query)
            scored = []
            for doc in docs:
                doc_set = set(doc)
                score = len(query_set & doc_set)
                scored.append((score, doc))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [doc for _, doc in scored[:3]]
        reranked_docs = simple_rerank(req.message, retrieved_docs)
        context = "\n\n".join(reranked_docs)
        # 3. 构造 Prompt
        prompt = f"""你是一个严谨的知识库问答助手。请严格根据以下资料回答问题，并用引号引用资料中的原文句子作为依据。
如果资料中找不到答案，请只回答“资料中未提及”。

资料：
{context}

用户问题：{req.message}

回答："""
        # 4. 调用 LLM
        response = client.chat.completions.create(
            model="glm-4-flash" ,
            messages=[{"role": "user", "content": prompt}],
            stream=False,
            temperature=0.1,        # 从 0.3 降到 0.1，进一步抑制随机性
            max_tokens=400,          # 限制输出长度，防止话多必失
            frequency_penalty=0.5,   # 惩罚重复，这是关键！
            presence_penalty=0.3
        )
        sources =[doc[:100] + "..." if len(doc) > 100 else doc for doc in reranked_docs]
        
        return {"reply": response.choices[0].message.content, "sources": sources}
    except Exception as e:
        return {"error": str(e)}