"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[]; // 新增字段：AI 回复时的相关文档片段
};
// 获取后端地址，优先使用环境变量，否则默认 localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clearing, setClearing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadStatus("上传中...");
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || data.error || "上传完成");
    } catch (err) {
      setUploadStatus("上传失败");
    }
    // 清空 input，以便同一文件再次选择可触发 onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 清空函数
  const handleClearDB = async () => {
    if (!window.confirm("确定要清空所有知识库内容吗？此操作不可恢复。")) return;
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clear-db`, { method: "POST" });
      const data = await res.json();
      setUploadStatus(data.message || "知识库已清空");
    } catch (err) {
      setUploadStatus("清空失败");
    } finally {
      setClearing(false);
    }
  };

  // 发送消息（调用 RAG 接口）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 创建一个占位的 AI 消息，稍后流式更新
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch(`${API_BASE_URL}/rag-chat-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!response.ok || !response.body) {
        throw new Error("网络错误");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 按行解析 SSE 事件
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 最后一个可能不完整，留下次处理

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "sources") {
                setLoading(false);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, sources: event.data }
                      : msg,
                  ),
                );
              } else if (event.type === "content") {
                setLoading(false);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: msg.content + event.data }
                      : msg,
                  ),
                );
              } else if (event.type === "error") {
                setLoading(false);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: "出错了：" + event.data }
                      : msg,
                  ),
                );
              }
              // done 事件无需特殊处理
            } catch (e) {
              /* 忽略解析错误 */
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: "请求失败" } : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // 当消息列表更新时（包括流式打字），自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]); // 依赖 messages 和 loading 变化

  return (
    <main className="flex flex-col h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">📚 RAG 知识库问答</h1>

      {/* 上传区域 */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="file"
          accept=".pdf,.md,.txt"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          上传文档 (PDF/MD/TXT)
        </button>
        <button
          onClick={handleClearDB}
          className="bg-red-400 text-white px-4 py-1 rounded"
          disabled={clearing}
        >
          {clearing ? "清空中..." : "清空知识库"}
        </button>
        {uploadStatus && (
          <span className="text-sm text-gray-600">{uploadStatus}</span>
        )}
      </div>

      {/* 对话区 */}
      <div ref={chatContainerRef} className="flex-1 overflow-auto border rounded p-2 space-y-2 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded ${m.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}
          >
            <strong>{m.role === "user" ? "你" : "AI"}:</strong> {m.content}
            {/* 新增：展示引用来源 */}
            {m.role === "assistant" && m.sources && m.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                <strong>📖 参考资料：</strong>
                {m.sources.map((src, i) => (
                  <div key={i} className="mt-1 pl-2 border-l-2 border-gray-300">
                    {src}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-gray-400 italic">AI 思考中...</div>}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="基于知识库提问..."
          className="flex-1 border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          发送
        </button>
      </form>
    </main>
  );
}
