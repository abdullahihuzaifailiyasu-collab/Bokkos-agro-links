import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    gray: 'bg-stone-100 text-stone-700 border-stone-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'AVAILABLE':
      return <Badge variant="green">● Available for Pickup</Badge>;
    case 'RESERVED':
      return <Badge variant="amber">● Reserved</Badge>;
    case 'SOLD_OUT':
      return <Badge variant="gray">● Sold Out</Badge>;
    case 'INACTIVE':
      return <Badge variant="red">● Inactive</Badge>;
    case 'PENDING':
      return <Badge variant="amber">⏳ Pending Review</Badge>;
    case 'ACCEPTED':
      return <Badge variant="green">✓ Request Accepted</Badge>;
    case 'REJECTED':
      return <Badge variant="red">✕ Declined</Badge>;
    case 'CANCELLED':
      return <Badge variant="gray">⊘ Cancelled</Badge>;
    case 'COMPLETED':
      return <Badge variant="blue">★ Completed</Badge>;
    case 'PENDING_FULFILLMENT':
      return <Badge variant="amber">📦 Awaiting Pickup / Handover</Badge>;
    case 'GRADE_A':
      return <Badge variant="green">Grade A (Premium)</Badge>;
    case 'GRADE_B':
      return <Badge variant="amber">Grade B (Table)</Badge>;
    case 'SEED_POTATO':
      return <Badge variant="purple">Certified Seed</Badge>;
    case 'COMMERCIAL':
      return <Badge variant="blue">Commercial Bulk</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};
