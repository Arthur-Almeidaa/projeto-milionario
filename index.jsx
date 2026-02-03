import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Copy, Check, Users, LogOut } from 'lucide-react';

export default function ChatApp() {
  const [screen, setScreen] = useState('home'); // home, create, join, chat
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Simulated Firebase - In production, use actual Firebase
  const db = useRef({
    rooms: JSON.parse(localStorage.getItem('chatRooms') || '{}')
  });

  const saveToLocalStorage = () => {
    localStorage.setItem('chatRooms', JSON.stringify(db.current.rooms));
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!username.trim()) {
      setError('Digite seu nome!');
      return;
    }
    const code = generateRoomCode();
    db.current.rooms[code] = {
      messages: [],
      users: [username]
    };
    saveToLocalStorage();
    setRoomCode(code);
    setScreen('chat');
    setError('');
  };

  const joinRoom = () => {
    if (!username.trim()) {
      setError('Digite seu nome!');
      return;
    }
    if (!inputRoomCode.trim()) {
      setError('Digite o código da sala!');
      return;
    }
    
    const code = inputRoomCode.toUpperCase();
    if (!db.current.rooms[code]) {
      setError('Sala não encontrada!');
      return;
    }

    if (!db.current.rooms[code].users.includes(username)) {
      db.current.rooms[code].users.push(username);
      saveToLocalStorage();
    }

    setRoomCode(code);
    setMessages(db.current.rooms[code].messages || []);
    setScreen('chat');
    setError('');
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: username,
      text: message,
      timestamp: new Date().toISOString()
    };

    db.current.rooms[roomCode].messages.push(newMessage);
    saveToLocalStorage();
    setMessages([...db.current.rooms[roomCode].messages]);
    setMessage('');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    setScreen('home');
    setRoomCode('');
    setMessages([]);
    setUsername('');
    setInputRoomCode('');
  };

  // Simulate real-time updates
  useEffect(() => {
    if (screen === 'chat' && roomCode) {
      const interval = setInterval(() => {
        const storedRooms = JSON.parse(localStorage.getItem('chatRooms') || '{}');
        if (storedRooms[roomCode]) {
          setMessages(storedRooms[roomCode].messages || []);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screen, roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Home Screen
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <MessageCircle className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat Manos</h1>
            <p className="text-gray-600">Converse com seus amigos em tempo real</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
            />

            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => setScreen('create')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Criar Nova Sala
            </button>

            <button
              onClick={() => setScreen('join')}
              className="w-full bg-white border-2 border-purple-600 text-purple-600 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all"
            >
              Entrar em uma Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Room Screen
  if (screen === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Criar Sala</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold">Seu nome:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              placeholder="Digite seu nome"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Criar Sala
            </button>

            <button
              onClick={() => setScreen('home')}
              className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Room Screen
  if (screen === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Entrar na Sala</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Seu nome:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Código da sala:</label>
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none uppercase"
                placeholder="Ex: ABC123"
                maxLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={joinRoom}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Entrar
            </button>

            <button
              onClick={() => setScreen('home')}
              className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h2 className="font-bold">Sala: {roomCode}</h2>
              <p className="text-sm opacity-90">@{username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomCode}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copiado!' : 'Copiar código'}</span>
            </button>
            
            <button
              onClick={leaveRoom}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.user === username
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  {msg.user !== username && (
                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.user}</p>
                  )}
                  <p className="break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.user === username ? 'opacity-70' : 'opacity-50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}