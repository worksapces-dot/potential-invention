"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

// AI Orb Component using video
function AIOrb({ size = 80 }: { size?: number }) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="rounded-full object-cover"
      style={{
        width: size,
        height: size,
      }}
    >
      <source src="/ai-orb.webm" type="video/webm" />
    </video>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm Slide's AI assistant. Ask me anything about automating your Instagram DMs!",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = { role: "user", content: trimmedInput }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const allMessages = [...messages, userMessage]
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      const replyContent =
        data.reply || "Sorry, something went wrong. Please try again!"

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyContent },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Couldn't connect. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button with AI Orb */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-black border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-white/40 overflow-hidden"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          animation: isOpen ? "none" : "float 3s ease-in-out infinite",
          boxShadow: "0 0 30px rgba(100, 200, 255, 0.25), 0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <AIOrb size={72} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] overflow-hidden rounded-3xl border border-white/10 bg-background shadow-2xl"
          style={{
            animation: "slideUp 0.3s ease-out",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header with AI Orb */}
          <div className="relative flex items-center gap-3 bg-black px-5 py-4 text-white overflow-hidden">
            <div 
              className="absolute left-0 top-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(100,200,255,0.5) 0%, transparent 70%)",
              }}
            />
            
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden">
              <AIOrb size={48} />
            </div>
            <div className="relative flex-1">
              <h3 className="font-semibold text-white">Slide AI</h3>
              <p className="text-xs text-white/50">Ask me anything about Slide</p>
            </div>
            <div className="relative flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50">Online</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[320px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-black border border-white/10">
                      <AIOrb size={32} />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-black border border-white/10">
                    <AIOrb size={32} />
                  </div>
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Slide..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-foreground/30 focus:bg-background disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Powered by AI • Free to use
            </p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
