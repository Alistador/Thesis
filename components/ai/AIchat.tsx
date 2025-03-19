"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send } from "lucide-react";

interface AIChatProps {
  code: string;
  onClose: () => void;
}

export default function AIChat({ code, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial system message when the chat opens
  useEffect(() => {
    setMessages([
      {
        role: "system",
        content:
          "You are a helpful AI coding assistant. The user is working with Python code. Keep your answers brief and focused on helping with coding problems.",
      },
      {
        role: "assistant",
        content:
          "Hi! I'm your AI coding assistant. How can I help with your Python code?",
      },
    ]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a helpful AI coding assistant. The user is working with the following Python code:\n\n${code}\n\nKeep your answers brief and focused on helping with coding problems.`,
            },
            ...messages.filter((msg) => msg.role !== "system"),
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check your API key or try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-3 z-50 w-64">
        <div className="flex justify-between items-center">
          <span className="font-medium">AI Assistant</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 bg-gray-800 text-white rounded-lg shadow-lg z-50 flex flex-col w-96 max-h-[70vh]">
      {/* Chat header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <span className="font-medium">AI Assistant</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80">
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-[90%] ${
                msg.role === "user" ? "bg-blue-600 ml-auto" : "bg-gray-700"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        {isLoading && (
          <div className="bg-gray-700 p-2 rounded-lg w-16">
            <p>Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code..."
            className="flex-1 bg-gray-700 text-white rounded-l-lg p-2 outline-none resize-none"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || input.trim() === ""}
            className="bg-blue-600 rounded-r-lg p-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
