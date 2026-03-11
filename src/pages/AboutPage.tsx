import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { Footer } from '../App';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                About InRide
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                InRide is revolutionizing the car rental industry by connecting customers directly with rental agencies.
                Our platform enables transparent negotiation, ensuring both parties get the best deal.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                Founded in 2024, we aim to make car rental accessible, affordable, and hassle-free for everyone.
                With thousands of vehicles and hundreds of partner agencies, we're your one-stop solution for all rental needs.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-slate-700">Verified Agencies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-slate-700">Instant Booking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-slate-700">Best Prices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-slate-700">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=800&fit=crop"
                  alt="Car rental"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-amber-600">4.9</div>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <div className="text-slate-600 text-sm">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
