'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Plane, Laptop, Target } from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function SavingsCard({ savings, onOpenAddGoal }) {
  const getIcon = (type) => {
    switch (type) {
      case 'shield':
        return <ShieldCheck size={18} stroke="#059669" strokeWidth={2.2} />;
      case 'plane':
        return <Plane size={18} stroke="#059669" strokeWidth={2.2} />;
      case 'laptop':
        return <Laptop size={18} stroke="#059669" strokeWidth={2.2} />;
      default:
        return <Target size={18} stroke="#059669" strokeWidth={2.2} />;
    }
  };

  const getBoxClass = (type) => {
    switch (type) {
      case 'shield': return 'box-shield';
      case 'plane': return 'box-plane';
      case 'laptop': return 'box-laptop';
      default: return 'box-shield';
    }
  };

  return (
    <div className="dashboard-card card-savings">
      <div className="card-header">
        <h2 className="card-title">Target tabungan</h2>
        <button className="card-action-link" onClick={onOpenAddGoal}>
          <span>Tambah</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="savings-list">
        {savings.map((goal) => {
          const ratio = (goal.current / goal.target) * 100;
          const percentage = ratio % 1 === 0 ? ratio.toFixed(0) : ratio.toFixed(1).replace('.', ',');
          const numericPercent = Math.min(100, ratio);
          const cleanTargetDate = goal.targetDate.startsWith('Target ') 
            ? goal.targetDate 
            : `Target ${goal.targetDate}`;

          return (
            <div key={goal.id} className="savings-card-item">
              <div className="savings-item-header">
                <div className={`savings-icon-box ${getBoxClass(goal.type)}`}>
                  {getIcon(goal.type)}
                </div>
                <div className="savings-item-meta">
                  <div className="savings-title">{goal.name}</div>
                  <div className="savings-target-date">{cleanTargetDate}</div>
                </div>
                <div className="savings-percent-badge">{percentage}%</div>
              </div>
              <div className="progress-track track-slim">
                <div 
                  className="progress-bar bar-green" 
                  style={{ width: `${numericPercent}%` }}
                />
              </div>
              <div className="savings-numbers-row">
                <span className="savings-current">{formatSimpleIDR(goal.current)}</span>
                <span className="savings-total">dari {formatSimpleIDR(goal.target)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
