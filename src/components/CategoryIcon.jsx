import React from 'react';
import * as Icons from 'lucide-react';

export const CategoryIcon = ({ name, className = 'w-5 h-5', color }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};

export const AVAILABLE_ICONS = [
  'ShoppingCart', 'Zap', 'Home', 'GraduationCap', 'Car', 'HeartPulse',
  'Shirt', 'Coffee', 'CreditCard', 'Briefcase', 'Award', 'TrendingUp',
  'Building', 'Users', 'Gift', 'ShieldCheck', 'Sparkles', 'Phone',
  'Wifi', 'Tv', 'Plane', 'Fuel', 'Utensils', 'Apple', 'Baby', 'Dog',
  'Wrench', 'BookOpen', 'Music', 'Camera', 'DollarSign', 'PiggyBank'
];
