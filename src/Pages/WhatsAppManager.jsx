import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api';
import toast from 'react-hot-toast';
import { formatDateTime } from '../Utils/formatters';

export default function WhatsAppManager() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery('whatsapp-conversations', async () => {
    const res = await api.get('/whatsapp/conversations');
    return res.data;
  });

  const { data: messages } = useQuery(
    ['whatsapp-messages', selectedConversation],
    async () => {
      if (!selectedConversation) return [];
      const res = await api.get(`/whatsapp/conversations/${selectedConversation}/messages`);
      return res.data;
    },
    { enabled: !!selectedConversation }
  );

  const sendMutation = useMutation(
    ({ conversationId, message }) => api.post('/whatsapp/send', { conversation_id: conversationId, message }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['whatsapp-messages', selectedConversation]);
        setMessage('');
        toast.success('Message sent');
      }
    }
  );

  const handleSend = () => {
    if (!selectedConversation || !message.trim()) return;
    sendMutation.mutate({ conversationId: selectedConversation, message });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Inbox</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Conversations</h3>
          <div className="space-y-2">
            {conversations?.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-2 rounded-lg transition ${selectedConversation === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <p className="font-medium">{conv.phone_number}</p>
                <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                <p className="text-xs text-gray-400">{formatDateTime(conv.last_message_at)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 card p-4 flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages?.map(msg => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-2 ${msg.direction === 'outbound' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatDateTime(msg.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type a message..." className="input flex-1" />
            <button onClick={handleSend} disabled={sendMutation.isLoading} className="btn-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}