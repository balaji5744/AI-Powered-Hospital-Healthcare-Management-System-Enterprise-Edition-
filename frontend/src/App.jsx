import React from 'react';
import AppointmentScheduler from './components/AppointmentScheduler';
import BillingInvoicePanel from './components/BillingInvoicePanel';
import './App.css';

function App() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '24px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* App Header */}
      <header style={{ 
        marginBottom: '32px', 
        borderBottom: '2px solid #e2e8f0', 
        paddingBottom: '16px' 
      }}>
        <h1 style={{ color: '#1e293b', margin: 0, fontSize: '2rem' }}>
          🏥 AI-Powered Hospital & Healthcare Management System
        </h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>
          Enterprise Edition • Live Clinical Dashboard
        </p>
      </header>

      {/* Main Responsive Grid layout */}
      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Left Side: Scheduling Module */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
          padding: '20px' 
        }}>
          <AppointmentScheduler />
        </div>

        {/* Right Side: Financial Module */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
          padding: '20px' 
        }}>
          <BillingInvoicePanel />
        </div>
      </main>
    </div>
  );
}

export default App;
