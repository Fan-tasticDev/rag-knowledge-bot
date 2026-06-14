"use client";
import { useEffect, useRef, useState } from "react";

export default function EmbedDemo() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const floatBtnRef = useRef<HTMLButtonElement>(null);
  const chatIframeRef = useRef<HTMLIFrameElement>(null);
  const [chatUrl, setChatUrl] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // 动态获取主聊天应用的地址，生产环境使用实际域名
    setChatUrl(window.location.origin);
  }, []);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const widget = widgetRef.current;
    if (!widget) return;
    const rect = widget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setIsDragging(true);

    const onMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>某 SaaS 管理后台</h1>
        <p style={{ color: "#666" }}>右下角已集成 AI 智能客服</p>
        <button
          onClick={toggleChat}
          style={{
            background: "#4f46e5",
            color: "white",
            border: "none",
            padding: "12px 28px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          📖 打开智能客服演示
        </button>
      </div>

      {/* 浮动按钮 */}
      <button
        ref={floatBtnRef}
        onClick={toggleChat}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#4f46e5",
          color: "white",
          border: "none",
          fontSize: 28,
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(79,70,229,0.4)",
          zIndex: 9998,
          display: isChatOpen ? "none" : "flex", // 修改
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        💬
      </button>

      {/* 客服弹窗 */}
      <div
        ref={widgetRef}
        style={{
          position: "fixed",
          ...(pos
            ? { left: pos.x, top: pos.y, transform: "none" }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
          width: 400,
          maxWidth: "90vw", // 小屏自适应
          height: 600,
          maxHeight: "80vh", // 不超过视口 80% 高度
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          borderRadius: 12,
          display: isChatOpen ? "flex" : "none",
          flexDirection: "column",
          zIndex: 9999,
          background: "white",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "auto",
        }}
      >
        {/* 标题栏：固定高度，不可伸缩 */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: "100%",
            height: 48,
            background: "#4f46e5",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            flexShrink: 0, // 关键：防止被 iframe 挤没
            boxSizing: "border-box",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 500 }}>🤖 智能客服助手</span>
          <button
            onClick={toggleChat}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* iframe：占据剩余全部空间，绝不超出 */}
        {chatUrl && (
          <iframe
            ref={chatIframeRef}
            src={chatUrl}
            style={{
              width: "100%",
              flex: 1,
              border: "none",
              display: "block", // 移除 iframe 默认的内联间隙
            }}
            title="智能客服"
          />
        )}
      </div>
    </div>
  );
}
