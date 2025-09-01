import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getApi, getApiBaseUrl } from '../api/client';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    const fetchSummary = async () => {
      setStatus('loading');
      const base = getApiBaseUrl();
      // Mock data if no base URL
      if (!base) {
        setSummary({ pendingOrders: 7, todaysRevenue: 2450, menuItems: 120 });
        setStatus('ready');
        return;
      }
      try {
        const api = getApi();
        const res = await api.get('/partner/summary');
        setSummary(res?.data || { pendingOrders: 0, todaysRevenue: 0, menuItems: 0 });
        setStatus('ready');
      } catch (err) {
        // Fallback to mock if network error
        if (err.message && err.message.includes('Network')) {
          setSummary({ pendingOrders: 7, todaysRevenue: 2450, menuItems: 120 });
          setStatus('ready');
          return;
        }
        setStatus('error');
      }
    };
    fetchSummary();
  }, []);

  const cardStyle = { border: '1px solid #ddd', padding: 16, borderRadius: 8, minWidth: 200 };

  return (
    <>
      <NavBar />
      <div style={{ padding: 16 }}>
        <h2>Partner Dashboard</h2>
        {status === 'loading' && <div>Loading...</div>}
        {status === 'error' && <div style={{ color: 'red' }}>Failed to load data.</div>}
        {status === 'ready' && summary && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: '#666' }}>Pending Orders</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{summary.pendingOrders}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: '#666' }}>Today's Revenue</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>${summary.todaysRevenue}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: '#666' }}>Menu Items</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{summary.menuItems}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
