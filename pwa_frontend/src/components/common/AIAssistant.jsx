import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react'

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your AI health assistant. I can help you understand your screening results, explain medical terms, and provide general health information. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const healthKeywords = {
    'heart rate': 'Normal resting heart rate for adults is 60-100 BPM. Athletes may have lower rates (40-60 BPM). Consult a doctor if consistently outside normal range.',
    'blood pressure': 'Normal blood pressure is less than 120/80 mmHg. High blood pressure (hypertension) is 130/80 mmHg or higher. Regular monitoring is important.',
    'spo2': 'Normal blood oxygen saturation (SpO2) is 95-100%. Values below 95% may indicate respiratory issues and should be evaluated by a healthcare professional.',
    'anemia': 'Anemia occurs when you don\'t have enough healthy red blood cells. Common symptoms include fatigue, weakness, and pale skin. Our eye analysis can help detect signs.',
    'jaundice': 'Jaundice causes yellowing of skin and eyes due to excess bilirubin. It can indicate liver problems or other conditions requiring medical attention.',
    'rppg': 'Remote photoplethysmography (rPPG) uses camera technology to detect blood flow changes in your face, allowing contactless vital sign monitoring.',
    'vital signs': 'Key vital signs include heart rate, respiration rate, blood pressure, and oxygen saturation. Regular monitoring helps track your health status.',
    'screening': 'Health screening helps detect potential issues early. Our platform provides preliminary assessments - always consult healthcare professionals for diagnosis.'
  }

  const generateResponse = async (userMessage) => {
    setIsTyping(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const lowerMessage = userMessage.toLowerCase()
    let response = ''

    // Check for health keywords
    const matchedKeyword = Object.keys(healthKeywords).find(keyword => 
      lowerMessage.includes(keyword)
    )

    if (matchedKeyword) {
      response = healthKeywords[matchedKeyword]
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = 'Hello! I\'m here to help with health-related questions. You can ask me about vital signs, screening results, or general health information.'
    } else if (lowerMessage.includes('help')) {
      response = 'I can assist you with:\n• Understanding your screening results\n• Explaining vital signs and health metrics\n• General health information\n• Navigation tips for the Arogya AI platform\n\nWhat specific topic would you like help with?'
    } else if (lowerMessage.includes('results') || lowerMessage.includes('report')) {
      response = 'To view your screening results, navigate to the Dashboard or Reports section. Your results include vital signs, risk assessments, and trend analysis. Remember, these are preliminary screenings - consult a healthcare professional for medical advice.'
    } else if (lowerMessage.includes('accuracy') || lowerMessage.includes('reliable')) {
      response = 'Our screening tools provide preliminary assessments for health awareness. While we use advanced AI and signal processing, results should not replace professional medical diagnosis. Always consult healthcare providers for medical decisions.'
    } else if (lowerMessage.includes('privacy') || lowerMessage.includes('data')) {
      response = 'Your privacy is paramount. All AI processing happens locally in your browser. Health data is only synced to our servers with your explicit consent and is anonymized for research purposes.'
    } else {
      response = 'I understand you\'re asking about "' + userMessage + '". While I focus on health screening topics, I recommend consulting our user guide or contacting support for specific technical questions. Is there a health-related topic I can help explain?'
    }

    setIsTyping(false)
    
    const botResponse = {
      id: Date.now(),
      type: 'bot',
      text: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, botResponse])
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = input
    setInput('')

    await generateResponse(messageText)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="animate-pulse"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: 'var(--gradient-primary)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-normal)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = 'var(--shadow-2xl)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = 'var(--shadow-xl)'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="card animate-slide-in" style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          width: 380,
          height: 500,
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--primary-green-200)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Bot size={20} style={{ marginRight: 8 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>AI Health Assistant</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Online • Ready to help</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 8
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: message.type === 'user' ? '#10b981' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {message.type === 'user' ? 
                    <User size={16} color="white" /> : 
                    <Bot size={16} color="white" />
                  }
                </div>

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: 18,
                  backgroundColor: message.type === 'user' ? '#dcfce7' : '#f1f5f9',
                  border: `1px solid ${message.type === 'user' ? '#bbf7d0' : '#e2e8f0'}`
                }}>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.text}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#64748b',
                    marginTop: 4
                  }}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 18,
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Loader size={14} style={{ 
                    animation: 'spin 1s linear infinite',
                    color: '#6366f1'
                  }} />
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: 8
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health results..."
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 20,
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: input.trim() && !isTyping ? '#2563eb' : '#d1d5db',
                border: 'none',
                color: 'white',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{
            padding: '8px 16px 16px',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}>
            {['Explain my results', 'Normal vital signs?', 'How accurate is this?'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e2e8f0'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8fafc'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}