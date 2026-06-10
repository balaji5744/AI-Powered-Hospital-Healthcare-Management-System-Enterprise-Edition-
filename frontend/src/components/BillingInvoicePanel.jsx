import React, { useState } from 'react';
import { hmsAPI } from '../services/api';

export default function BillingInvoicePanel() {
  const [form, setForm] = useState({ appointment_id: 'APP-9921', consultation_fee: 500, lab_fees: 0, pharmacy_fees: 0 });
  const [invoice, setInvoice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await hmsAPI.post('/billing/invoices/generate', {
        appointment_id: form.appointment_id,
        consultation_fee: parseFloat(form.consultation_fee),
        lab_fees: parseFloat(form.lab_fees),
        pharmacy_fees: parseFloat(form.pharmacy_fees),
      });
      setInvoice(response.data);
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>💳 Institutional Billing Desk (Day 1)</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Appt ID" value={form.appointment_id} onChange={e => setForm({...form, appointment_id: e.target.value})} /><br /><br />
        <input type="number" placeholder="Consultation Fee" value={form.consultation_fee} onChange={e => setForm({...form, consultation_fee: e.target.value})} /><br /><br />
        <button type="submit">Calculate & Generate Invoice</button>
      </form>
      {invoice && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#eee' }}>
          <h3>📄 Invoice: {invoice.invoice_id}</h3>
          <p>Subtotal: ${invoice.subtotal}</p>
          <p>Tax (5%): ${invoice.tax}</p>
          <p>Grand Total: ${invoice.grand_total}</p>
        </div>
      )}
    </div>
  );
}