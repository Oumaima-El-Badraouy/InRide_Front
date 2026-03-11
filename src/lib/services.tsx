import { ReactNode } from 'react';
import { Route as RouteIcon, DollarSign, Shield, Clock } from 'lucide-react';

export interface Service {
  icon: ReactNode;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    icon: <RouteIcon className="w-8 h-8" />,
    title: 'Wide Fleet Selection',
    description: 'Choose from sedans, SUVs, trucks, and luxury vehicles from trusted agencies.',
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: 'Best Price Guarantee',
    description: 'Negotiate directly with agencies to get the best deals on your rental.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Secure Booking',
    description: 'Your payments and personal information are protected with enterprise-grade security.',
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you at any time.',
  },
];
