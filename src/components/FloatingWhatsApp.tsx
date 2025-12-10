'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message || 'Hi, I have a question about your products.')}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-80 max-w-[calc(100vw-2rem)] animate-slide-in-right">
          <div className="glass-card-enhanced rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-white font-medium">Naveen Textiles</p>
                  <p className="text-green-100 text-xs">Typically replies instantly</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-dark-200 text-sm">
                  👋 Hi there! How can we help you today?
                </p>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full px-3 py-2 glass-card rounded-lg text-dark-200 text-sm placeholder-dark-500 outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
              />

              <button
                onClick={handleSend}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 rounded-lg font-medium hover:from-green-500 hover:to-green-400 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 animate-float group"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
        )}
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      </button>
    </>
  );
}