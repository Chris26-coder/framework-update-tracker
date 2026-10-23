import React from 'react';
import { PlusCircle, Edit3, Trash2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  type: 'change' | 'tier' | 'run';
  value: string | number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  if (type === 'change') {
    const val = String(value).toLowerCase();
    if (val === 'added') {
      return (
        <span className="badge badge-added">
          <PlusCircle size={12} />
          Added
        </span>
      );
    }
    if (val === 'modified') {
      return (
        <span className="badge badge-modified">
          <Edit3 size={12} />
          Modified
        </span>
      );
    }
    if (val === 'removed') {
      return (
        <span className="badge badge-removed">
          <Trash2 size={12} />
          Removed
        </span>
      );
    }
  }

  if (type === 'tier') {
    const val = Number(value);
    if (val === 1) {
      return <span className="badge badge-tier1">Tier 1 • Official API/Git</span>;
    }
    return <span className="badge badge-tier2">Tier 2 • Web Scraped</span>;
  }

  if (type === 'run') {
    const val = String(value).toLowerCase();
    if (val === 'success') {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} />
          Success
        </span>
      );
    }
    if (val === 'no_change') {
      return (
        <span className="badge badge-neutral">
          <Clock size={12} />
          No Change
        </span>
      );
    }
    if (val === 'failed') {
      return (
        <span className="badge badge-failed">
          <XCircle size={12} />
          Failed
        </span>
      );
    }
    return (
      <span className="badge badge-neutral">
        <AlertCircle size={12} />
        {val}
      </span>
    );
  }

  return <span className="badge badge-neutral">{String(value)}</span>;
};
