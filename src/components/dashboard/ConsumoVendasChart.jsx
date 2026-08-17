import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmtQty } from '@/lib/dashboardData';

export function ConsumoVendasChart({ data }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE6EA" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667983' }} stroke="#B8C6CC" />
          <YAxis tick={{ fontSize: 12, fill: '#667983' }} stroke="#B8C6CC" />
          <Tooltip formatter={(v) => fmtQty(v)} contentStyle={{ fontSize: 12, border: '1px solid #D5E0E5', borderRadius: 8, color: '#18323D' }} />
          <Legend />
          <Line type="monotone" dataKey="consumo" name="Consumo" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#16856A" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
