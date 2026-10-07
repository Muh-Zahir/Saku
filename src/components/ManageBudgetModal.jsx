import React, { useState } from 'react';
import { PieChart, X } from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function ManageBudgetModal({ isOpen, onClose, budgets, onSaveBudgets }) {
  const [editedBudgets, setEditedBudgets] = useState(budgets);

  if (!isOpen) return null;

  const handleLimitChange = (id, newLimit) => {
    setEditedBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, limit: Number(newLimit) || 0 } : b))
    );
  };

  const handleSave = () => {
    onSaveBudgets(editedBudgets);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <PieChart size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Kelola Anggaran Bulanan</h3>
              <p className="modal-desc">Atur batas pengeluaran untuk setiap pos keuangan.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="budget-modal-body">
          {editedBudgets.map((b) => (
            <div key={b.id} className="budget-edit-item">
              <div>
                <div className="budget-edit-label">{b.name}</div>
                <div style={{ fontSize: '11px', color: '#8c9e94', marginTop: '2px' }}>
                  Terpakai: {formatSimpleIDR(b.spent)}
                </div>
              </div>
              <input
                type="number"
                className="budget-edit-input"
                value={b.limit}
                onChange={(e) => handleLimitChange(b.id, e.target.value)}
                step="50000"
              />
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ padding: '0 24px 20px' }}>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn-submit" onClick={handleSave}>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
