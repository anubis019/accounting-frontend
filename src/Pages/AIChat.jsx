import React, { useState, useRef, useEffect } from 'react'
import api from '../api'
import ReactMarkdown from 'react-markdown'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('chat_history')
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI financial assistant. How can I help you today?\n\nYou can ask me about:\n• How to reduce expenses\n• Budgeting tips\n• Profit improvement strategies\n• Saving money\n• Financial planning",
        timestamp: new Date()
      }])
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input, timestamp: new Date() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    localStorage.setItem('chat_history', JSON.stringify(updatedMessages))
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.post('/ai/chat', {
        message: input,
        history: messages.slice(-5)
      })

      const aiMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      localStorage.setItem('chat_history', JSON.stringify(finalMessages))

    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearHistory = () => {
    localStorage.removeItem('chat_history')
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI financial assistant. How can I help you today?",
      timestamp: new Date()
    }])
  }

  const suggestedQuestions = [
    "How can I reduce my business expenses?",
    "What's a good profit margin for a small business?",
    "How should I budget for next month?",
    "Tips for saving money",
    "How to track cash flow effectively?"
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🤖 AI Financial Assistant</h1>
        <button onClick={clearHistory} className="text-sm text-gray-500 hover:text-red-600">
          Clear History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to AcctSys AI</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Ask me anything about managing your finances</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm hover:bg-gray-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : msg.isError
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <div className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 self-end"
        >
          Send
        </button>
      </div>
    </div>
  )
}