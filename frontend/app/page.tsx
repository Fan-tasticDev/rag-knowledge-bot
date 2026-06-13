'use client';
import { useState, useRef } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};
 // 获取后端地址，优先使用环境变量，否则默认 localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus('上传中...');
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data.message || data.error || '上传完成');
    } catch (err) {
      setUploadStatus('上传失败');
    }
    // 清空 input，以便同一文件再次选择可触发 onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 发送消息（调用 RAG 接口）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rag-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || '出错了',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: '请求失败' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">📚 RAG 知识库问答</h1>
      
      {/* 上传区域 */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          上传 PDF
        </button>
        {uploadStatus && <span className="text-sm text-gray-600">{uploadStatus}</span>}
      </div>

      {/* 对话区 */}
      <div className="flex-1 overflow-auto border rounded p-2 space-y-2 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <strong>{m.role === 'user' ? '你' : 'AI'}:</strong> {m.content}
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
          发送
        </button>
      </form>
    </main>
  );
}