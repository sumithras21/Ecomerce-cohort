import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/analytics';

function App() {
  const [kpis, setKpis] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);

  useEffect(() => {
    // Fetch KPIs
    axios.get(`${API_URL}/kpis`)
      .then(res => setKpis(res.data))
      .catch(err => console.error("Error fetching KPIs:", err));

    // Fetch Monthly Sales
    axios.get(`${API_URL}/sales/monthly`)
      .then(res => setMonthlySales(res.data))
      .catch(err => console.error("Error fetching sales:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">📊 Ecommerce Data Intelligence</h1>
          <p className="text-gray-500 mt-2">Modern full-stack application (FastAPI + React)</p>
        </header>
        
        {/* KPI Cards */}
        {kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">${kpis.total_revenue?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Orders</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{kpis.total_orders?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customers</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{kpis.unique_customers?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Order Value</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">${kpis.avg_order_value?.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">Loading metrics from API...</div>
        )}

        {/* Charts */}
        {(!monthlySales || monthlySales.length === 0) ? (
            <div className="p-8 text-center text-gray-500">Loading sales charts...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Revenue Trend</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
