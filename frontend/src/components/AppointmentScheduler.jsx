import React, { useState, useEffect } from 'react';
import { hmsAPI } from '../services/api';

export default function AppointmentScheduler() {
  const [doctorId, setDoctorId] = useState('DOC-101');
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const response = await hmsAPI.get(`/appointments/doctors/${doctorId}/slots`, {
          params: { date: selectedDate },
        });
        setSlots(response.data.available_slots);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchAvailableSlots();
  }, [doctorId, selectedDate]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>🗓️ Book Doctor Appointment (Day 1)</h2>
      <label>Select Doctor ID: </label>
      <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
        <option value="DOC-101">DOC-101</option>
        <option value="DOC-102">DOC-102</option>
      </select>
      <input type="date" value={selectedDate} style={{ marginLeft: '10px' }} onChange={(e) => setSelectedDate(e.target.value)} />
      <h3>Available Time Slots:</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        {slots.map(slot => <button key={slot} style={{ padding: '8px' }}>{slot}</button>)}
      </div>
    </div>
  );
}