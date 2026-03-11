import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../App';
import { Route as RouteIcon, DollarSign, Shield, Clock } from 'lucide-react';

import { services } from '../lib/services';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We provide comprehensive car rental solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
