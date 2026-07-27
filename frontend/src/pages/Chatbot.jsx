import React, { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your SAWS virtual assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Fake bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'I understand you need help with that. I am currently just a UI placeholder, but soon I will be connected to AWS Lex!' }]);
    }, 1000);
  };

  return (
    <div className="card" style={{maxWidth: '600px', margin: '0 auto', height: '600px', display: 'flex', flexDirection: 'column'}}>
      <div style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem'}}>
        <h3 style={{margin: 0}}>Wellness Assistant</h3>
        <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)'}}>Powered by AWS Lex</p>
      </div>
      
      <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0'}}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            background: msg.sender === 'user' ? 'var(--primary)' : '#f3f4f6',
            color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
            padding: '0.75rem 1rem',
            borderRadius: '1rem',
            maxWidth: '80%'
          }}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSend} style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your message..." 
          style={{flex: 1}} 
        />
        <button type="submit" className="btn">Send</button>
      </form>
    </div>
  );
}

export default Chatbot;
