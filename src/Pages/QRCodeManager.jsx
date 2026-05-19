import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

export default function QRCodeManager() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', title: '', description: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('my-qr-codes', async () => {
    const res = await api.get('/qr/my-codes');
    return res.data;
  });

  const generateMutation = useMutation(
    (data) => api.post('/qr/generate/payment', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-qr-codes');
        toast.success('QR code generated');
        setShowForm(false);
        setForm({ amount: '', title: '', description: '' });
      }
    }
  );

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!form.amount || !form.title) return toast.error('Amount and title required');
    generateMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Payments</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Generate QR
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Payment QR</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="label">Amount (KES)</label>
              <input type="number" required value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Title</label>
              <input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="input" rows={2} />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Generate</button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p>Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map(qr => (
          <div key={qr.id} className="card p-4 text-center">
            <QRCodeSVG value={`${window.location.origin}/pay/${qr.code}`} size={180} className="mx-auto my-3" />
            <p className="font-bold">{qr.title}</p>
            <p className="text-sm text-gray-500">{qr.description}</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(qr.amount)}</p>
            <p className="text-xs text-gray-400 mt-2">Scans: {qr.scans_count} | Payments: {qr.payments_count}</p>
            <a href={`${import.meta.env.VITE_API_URL}/api/qr/${qr.id}/download`} className="text-primary-600 text-sm mt-2 inline-block">Download PNG</a>
          </div>
        ))}
      </div>
    </div>
  );
}