import React, { useState } from 'react';
import { Target, X } from 'lucide-react';

export default function AddGoalModal({ isOpen, onClose, onAddGoal }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetMonth, setTargetMonth] = useState('2027-06');
  const [type, setType] = useState('shield');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(targetAmount.replace(/\D/g, ''), 10);
    const current = parseInt(currentAmount.replace(/\D/g, '') || '0', 10);

    if (!name || !target || target <= 0) {
      alert('Mohon isi target tabungan dengan benar!');
      return;
    }

    const dateObj = new Date(targetMonth);
    const targetDate = `Target ${dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;

    const newGoal = {
      id: `s-${Date.now()}`,
      name: name.trim(),
      targetDate,
      current,
      target,
      type
    };

    onAddGoal(newGoal);
    onClose();
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Target size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Tambah Target Tabungan</h3>
              <p className="modal-desc">Wujudkan impian finansialmu dengan perencanaan bertahap.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nama Target</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Dana Nikah, DP Rumah, Umroh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Jumlah Target (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 10000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Terkumpul Saat Ini (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Batas Waktu</label>
              <input
                type="month"
                className="form-input"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ikon</label>
              <select 
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="shield">Perlindungan / Darurat</option>
                <option value="plane">Liburan / Travel</option>
                <option value="laptop">Elektronik / Gadget</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Buat Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
