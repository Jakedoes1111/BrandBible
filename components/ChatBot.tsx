import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithBot } from '../services/geminiService';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! How can I help you with your branding today?" }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: currentMessage };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const botResponse = await chatWithBot(nextMessages, currentMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-400 text-black rounded-full p-4 shadow-lg shadow-green-500/30 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-transform hover:scale-110"
        aria-label="Open chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right">
          <header className="bg-black/50 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
            <h3 className="font-bold text-lg text-white">Branding Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto bg-black/30">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-200'}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-700 text-gray-200">
                      <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                         <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                         <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-300"></div>
                      </div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-black/50 rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question..."
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-200"
              />
              <button type="submit" className="bg-green-500 text-black p-2 rounded-md hover:bg-green-600 disabled:bg-green-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
