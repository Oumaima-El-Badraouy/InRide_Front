import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useState, useEffect, ReactNode } from 'react';
import {
  Car,
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  DollarSign,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';

// Types
interface Request {
  id: string;
  clientId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  carType: string;
  budget: number;
  additionalNotes?: string;
  status: string;
  createdAt: string;
}

interface Offer {
  id: string;
  requestId: string;
  agencyId: string;
  carModel: string;
  carType: string;
  carImageUrl?: string;
  dailyRate: number;
  finalRate?: number;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  offerId: string;
  senderId: string;
  content: string;
  isPriceProposal: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'AGENCY';
  firstName: string;
  lastName: string;
  phone: string;
  nationality: string;
  avatarUrl?: string;
  companyName?: string;
  createdAt: string;
}

// Database functions
const STORAGE_KEYS = {
  USERS: 'inride_users',
  REQUESTS: 'inride_requests',
  OFFERS: 'inride_offers',
  MESSAGES: 'inride_messages',
  CURRENT_USER: 'inride_current_user',
};

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function initializeDatabase(): void {
  const users = getFromStorage(STORAGE_KEYS.USERS);
  if (users.length === 0) {
    const sampleUsers = [
      {
        id: generateId(),
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT' as const,
        firstName: 'Alex',
        lastName: 'Martin',
        phone: '+1 555-0100',
        nationality: 'USA',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'elite@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1 555-0101',
        nationality: 'USA',
        companyName: 'Elite Car Rental',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'swift@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1 555-0102',
        nationality: 'Spain',
        companyName: 'Swift Wheels',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'premium@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+1 555-0103',
        nationality: 'UAE',
        companyName: 'Premium Drive',
        createdAt: new Date().toISOString(),
      },
    ];
    saveToStorage(STORAGE_KEYS.USERS, sampleUsers);
  }
}

function getCurrentUserFromStorage(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

function loginUser(email: string, password: string): User | null {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const user = users.find((u: User) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function createUserInStorage(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const newUser: User = {
    ...userData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  return newUser;
}

function createRequestInStorage(requestData: Omit<Request, 'id' | 'createdAt' | 'status'>): Request {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  const newRequest: Request = {
    ...requestData,
    id: generateId(),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  return newRequest;
}

function getRequestsFromStorage(): Request[] {
  return getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
}

function getRequestsByClientId(clientId: string): Request[] {
  return getRequestsFromStorage().filter((r: Request) => r.clientId === clientId);
}

function getOpenRequestsFromStorage(): Request[] {
  return getRequestsFromStorage().filter((r: Request) => r.status === 'OPEN');
}

function updateRequestInStorage(id: string, updates: Partial<Request>): void {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  const index = requests.findIndex((r: Request) => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  }
}

function createOfferInStorage(offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>): Offer {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  const newOffer: Offer = {
    ...offerData,
    id: generateId(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  offers.push(newOffer);
  saveToStorage(STORAGE_KEYS.OFFERS, offers);
  updateRequestInStorage(offerData.requestId, { status: 'NEGOTIATING' });
  return newOffer;
}

function getOffersFromStorage(): Offer[] {
  return getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
}

function getOffersByRequestId(requestId: string): Offer[] {
  return getOffersFromStorage().filter((o: Offer) => o.requestId === requestId);
}

function getOffersByAgencyId(agencyId: string): Offer[] {
  return getOffersFromStorage().filter((o: Offer) => o.agencyId === agencyId);
}

function updateOfferInStorage(id: string, updates: Partial<Offer>): void {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  const index = offers.findIndex((o: Offer) => o.id === id);
  if (index !== -1) {
    offers[index] = { ...offers[index], ...updates };
    saveToStorage(STORAGE_KEYS.OFFERS, offers);
  }
}

function createMessageInStorage(messageData: Omit<Message, 'id' | 'createdAt'>): Message {
  const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
  const newMessage: Message = {
    ...messageData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  saveToStorage(STORAGE_KEYS.MESSAGES, messages);
  if (messageData.isPriceProposal) {
    updateOfferInStorage(messageData.offerId, { status: 'NEGOTIATING' });
  }
  return newMessage;
}

function getMessagesByOfferId(offerId: string): Message[] {
  return getMessagesFromStorage()
    .filter((m: Message) => m.offerId === offerId)
    .sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function getMessagesFromStorage(): Message[] {
  return getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
}

function getUserById(id: string): User | undefined {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find((u: User) => u.id === id);
}

function acceptOfferInStorage(offerId: string): { success: boolean; message: string } {
  const offers = getOffersFromStorage();
  const offer = offers.find((o: Offer) => o.id === offerId);
  if (!offer) return { success: false, message: 'Offer not found' };

  const requests = getRequestsFromStorage();
  const request = requests.find((r: Request) => r.id === offer.requestId);
  if (!request) return { success: false, message: 'Request not found' };

  updateOfferInStorage(offerId, { status: 'ACCEPTED', finalRate: offer.finalRate || offer.dailyRate });
  updateRequestInStorage(request.id, { status: 'BOOKED' });

  offers.forEach((o: Offer) => {
    if (o.requestId === request.id && o.id !== offerId) {
      updateOfferInStorage(o.id, { status: 'REJECTED' });
    }
  });

  return { success: true, message: 'Deal accepted successfully!' };
}

// Components
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }
  return <>{children}</>;
}

function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">InRide</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-sky-600 transition-colors">Home</Link>
            <Link to="/#services" className="text-slate-600 hover:text-sky-600 transition-colors">Services</Link>
            <Link to="/#about" className="text-slate-600 hover:text-sky-600 transition-colors">About</Link>
            <Link to="/#team" className="text-slate-600 hover:text-sky-600 transition-colors">Team</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <NotificationBell userId={user.id} userRole={user.role} />
                <Link
                  to={user.role === 'CLIENT' ? '/dashboard' : '/agency'}
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-sky-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="text-slate-600 hover:text-sky-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-slate-600">Home</Link>
              <Link to="/#services" className="text-slate-600">Services</Link>
              <Link to="/#about" className="text-slate-600">About</Link>
              <Link to="/#team" className="text-slate-600">Team</Link>
              {user ? (
                <>
                  <Link to={user.role === 'CLIENT' ? '/dashboard' : '/agency'} className="text-slate-600">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-slate-600">
                    Profile
                  </Link>
                  <button onClick={logout} className="text-left text-slate-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/auth/signin" className="text-slate-600">Sign In</Link>
                  <Link to="/auth/signup" className="text-sky-600 font-medium">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">InRide</span>
            </div>
            <p className="text-slate-400">
              Your trusted car rental platform. Connect with agencies and get the best deals on vehicle rentals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">Home</Link></li>
              <li><Link to="/#services" className="hover:text-sky-400 transition-colors">Services</Link></li>
              <li><Link to="/#about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/#team" className="hover:text-sky-400 transition-colors">Team</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Car Rental</li>
              <li>Airport Pickup</li>
              <li>Long-term Lease</li>
              <li>24/7 Support</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-400">
              <li>info@inride.com</li>
              <li>+1 555-000-0000</li>
              <li>123 Ride Street</li>
              <li>New York, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 InRide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Home Page
function HomePage() {
  const { user } = useAuth();

  const services = [
    {
      icon: <Car className="w-8 h-8" />,
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

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      name: 'Emily Davis',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    {
      name: 'James Wilson',
      role: 'Head of Partnerships',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Your Trusted Car Rental Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Rent a Car with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500"> Confidence</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Connect directly with car rental agencies, negotiate your best deal, and enjoy a seamless rental experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? (user.role === 'CLIENT' ? '/dashboard' : '/agency') : '/auth/signup'}
              className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/#services"
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-lg transition-all border border-slate-200"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-sky-600">10K+</div>
              <div className="text-slate-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600">500+</div>
              <div className="text-slate-600">Car Agencies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-600">50K+</div>
              <div className="text-slate-600">Rentals Completed</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
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
                className="p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Renting a car has never been easier - follow these simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Request', description: 'Fill out a form with your car preferences, dates, and budget.' },
              { step: '02', title: 'Receive Offers', description: 'Get competitive offers from multiple agencies in your area.' },
              { step: '03', title: 'Negotiate & Book', description: 'Chat with agencies, negotiate the best price, and confirm your booking.' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-sky-100 absolute -top-4 -left-4">{item.step}</div>
                <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-lg">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-sky-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
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
                  <div className="text-3xl font-bold text-sky-600">4.9</div>
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

      {/* Team Section */}
      <section id="team" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The dedicated people behind InRide who work tirelessly to improve your rental experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-square">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-slate-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Auth Pages
function SignInPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'CLIENT' ? '/dashboard' : '/agency'} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      const currentUser = getCurrentUserFromStorage();
      navigate(currentUser?.role === 'CLIENT' ? '/dashboard' : '/agency');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">InRide</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-600 mt-2">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-sky-600 hover:text-sky-700 font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              Demo accounts:<br />
              Client: client@example.com / password123<br />
              Agency: elite@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignUpPage() {
  const [role, setRole] = useState<'CLIENT' | 'AGENCY'>('CLIENT');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    if (users.find((u: User) => u.email === formData.email)) {
      setError('Email already exists');
      return;
    }

    const newUser = createUserInStorage({
      email: formData.email,
      password: formData.password,
      role,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      nationality: formData.nationality,
      companyName: role === 'AGENCY' ? formData.companyName : undefined,
    });

    navigate(newUser.role === 'CLIENT' ? '/dashboard' : '/agency');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">InRide</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-600 mt-2">Join InRide today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">I want to:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'CLIENT'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Rent a Car</div>
                <div className="text-xs text-slate-500">I'm a customer</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('AGENCY')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'AGENCY'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Car className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">List Cars</div>
                <div className="text-xs text-slate-500">I'm an agency</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {role === 'AGENCY' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-sky-600 hover:text-sky-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client Dashboard
function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    carType: 'Sedan',
    budget: '',
    additionalNotes: '',
  });

  useEffect(() => {
    if (user) {
      setRequests(getRequestsByClientId(user.id));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newRequest = createRequestInStorage({
      clientId: user.id,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      pickupDate: formData.pickupDate,
      dropoffDate: formData.dropoffDate,
      carType: formData.carType,
      budget: parseFloat(formData.budget),
      additionalNotes: formData.additionalNotes || undefined,
    });

    setRequests([newRequest, ...requests]);
    setShowNewRequest(false);
    setFormData({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      dropoffDate: '',
      carType: 'Sedan',
      budget: '',
      additionalNotes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-emerald-100 text-emerald-700';
      case 'NEGOTIATING': return 'bg-amber-100 text-amber-700';
      case 'BOOKED': return 'bg-sky-100 text-sky-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const activeRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const negotiatingRequests = requests.filter(r => r.status === 'NEGOTIATING').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-slate-600 mt-1">Manage your car rental requests</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Active Requests</p>
                  <p className="text-3xl font-bold text-slate-900">{activeRequests}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Negotiations</p>
                  <p className="text-3xl font-bold text-slate-900">{negotiatingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {requests.filter(r => r.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* New Request Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewRequest(!showNewRequest)}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors flex items-center"
            >
              {showNewRequest ? 'Cancel' : 'New Request'}
              {!showNewRequest && <Car className="w-5 h-5 ml-2" />}
            </button>
          </div>

          {/* New Request Form */}
          {showNewRequest && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New Request</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="City, Airport, or Address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Drop-off Location</label>
                  <input
                    type="text"
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="City, Airport, or Address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Date</label>
                  <input
                    type="datetime-local"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Drop-off Date</label>
                  <input
                    type="datetime-local"
                    value={formData.dropoffDate}
                    onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Car Type</label>
                  <select
                    value={formData.carType}
                    onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Sports Car">Sports Car</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget (per day)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special requirements or preferences..."
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Requests List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">My Requests</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No requests yet. Create your first request!</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className="text-sm text-slate-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span className="text-slate-900">{request.pickupLocation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{request.dropoffLocation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">{request.carType}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.pickupDate).toLocaleDateString()} - {new Date(request.dropoffDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${request.budget}/day</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/dashboard/request/${request.id}`}
                        className="ml-4 px-4 py-2 bg-sky-100 text-sky-600 rounded-lg font-medium hover:bg-sky-200 transition-colors"
                      >
                        View Offers
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client Request Detail Page
function ClientRequestDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [showChat, setShowChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);

  const request = getRequestsFromStorage().find((r: Request) => r.id === id);

  useEffect(() => {
    if (id) {
      setOffers(getOffersByRequestId(id));
      const offersList = getOffersByRequestId(id);
      const messagesMap: Record<string, Message[]> = {};
      offersList.forEach((o: Offer) => {
        messagesMap[o.id] = getMessagesByOfferId(o.id);
      });
      setMessages(messagesMap);
    }
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Request not found</p>
          <Link to="/dashboard" className="text-sky-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = (offerId: string) => {
    if (!messageInput.trim() || !user) return;

    createMessageInStorage({
      offerId,
      senderId: user.id,
      content: messageInput,
      isPriceProposal: false,
    });

    setMessages({
      ...messages,
      [offerId]: [...(messages[offerId] || []), {
        id: generateId(),
        offerId,
        senderId: user.id,
        content: messageInput,
        isPriceProposal: false,
        createdAt: new Date().toISOString(),
      }],
    });
    setMessageInput('');
  };

  const handleSendPriceProposal = (offerId: string) => {
    if (!priceInput.trim() || !user) return;

    const newMessage: Message = {
      id: generateId(),
      offerId,
      senderId: user.id,
      content: `Price Proposal: $${priceInput}`,
      isPriceProposal: true,
      createdAt: new Date().toISOString(),
    };

    createMessageInStorage({
      offerId,
      senderId: user.id,
      content: newMessage.content,
      isPriceProposal: true,
    });

    // Update offer with final rate
    const offer = offers.find((o: Offer) => o.id === offerId);
    if (offer) {
      updateOfferInStorage(offerId, { finalRate: parseFloat(priceInput) });
      setOffers(offers.map((o: Offer) => o.id === offerId ? { ...o, finalRate: parseFloat(priceInput) } : o));
    }

    setMessages({
      ...messages,
      [offerId]: [...(messages[offerId] || []), newMessage],
    });
    setPriceInput('');
    setShowPriceInput(false);
  };

  const handleAcceptOffer = (offerId: string) => {
    const result = acceptOfferInStorage(offerId);
    if (result.success) {
      setOffers(offers.map((o: Offer) => o.id === offerId ? { ...o, status: 'ACCEPTED' } : { ...o, status: o.id !== offerId && o.requestId === request?.id ? 'REJECTED' : o.status }));
      window.location.href = `/booking/${offerId}`;
    }
  };

  const agencyNames: Record<string, string> = {};
  offers.forEach((o: Offer) => {
    const agency = getUserById(o.agencyId);
    if (agency) {
      agencyNames[o.agencyId] = agency.companyName || `${agency.firstName} ${agency.lastName}`;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="text-sky-600 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>

          {/* Request Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Request Details</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                request.status === 'NEGOTIATING' ? 'bg-amber-100 text-amber-700' :
                'bg-sky-100 text-sky-700'
              }`}>
                {request.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm text-slate-500">Pickup Location</label>
                <p className="font-medium text-slate-900">{request.pickupLocation}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Drop-off Location</label>
                <p className="font-medium text-slate-900">{request.dropoffLocation}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Dates</label>
                <p className="font-medium text-slate-900">
                  {new Date(request.pickupDate).toLocaleDateString()} - {new Date(request.dropoffDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Budget</label>
                <p className="font-medium text-slate-900">${request.budget}/day</p>
              </div>
            </div>
          </div>

          {/* Offers */}
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Offers from Agencies ({offers.length})</h2>

          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No offers yet. Agencies will respond soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer: Offer) => (
                <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{agencyNames[offer.agencyId]}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offer.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                          offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          offer.status === 'NEGOTIATING' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-slate-500">Car Model</label>
                          <p className="font-medium text-slate-900">{offer.carModel}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">Car Type</label>
                          <p className="font-medium text-slate-900">{offer.carType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-500">Price</label>
                          <p className="font-medium text-slate-900">
                            ${offer.finalRate || offer.dailyRate}/day
                            {offer.finalRate && offer.finalRate !== offer.dailyRate && (
                              <span className="text-slate-500 line-through ml-2">${offer.dailyRate}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Chat Section */}
                      {showChat === offer.id && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                          <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                            {(messages[offer.id] || []).length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
                            ) : (
                              (messages[offer.id] || []).map((msg: Message) => {
                                const sender = getUserById(msg.senderId);
                                const isOwn = msg.senderId === user?.id;
                                return (
                                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-xl ${
                                      msg.isPriceProposal
                                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                                        : isOwn
                                          ? 'bg-sky-500 text-white'
                                          : 'bg-white text-slate-900 border border-slate-200'
                                    }`}>
                                      <p className="text-sm">{msg.content}</p>
                                      <p className={`text-xs mt-1 ${isOwn ? 'text-sky-100' : 'text-slate-500'}`}>
                                        {sender?.firstName} - {new Date(msg.createdAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {offer.status !== 'ACCEPTED' && offer.status !== 'REJECTED' && (
                            <div className="space-y-2">
                              {showPriceInput ? (
                                <div className="flex space-x-2">
                                  <input
                                    type="number"
                                    value={priceInput}
                                    onChange={(e) => setPriceInput(e.target.value)}
                                    placeholder="Enter new price"
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                                  />
                                  <button
                                    onClick={() => handleSendPriceProposal(offer.id)}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                                  >
                                    Send
                                  </button>
                                  <button
                                    onClick={() => setShowPriceInput(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(offer.id)}
                                  />
                                  <button
                                    onClick={() => handleSendMessage(offer.id)}
                                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                                  >
                                    Send
                                  </button>
                                  <button
                                    onClick={() => setShowPriceInput(true)}
                                    className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                                  >
                                    Propose Price
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {offer.status !== 'ACCEPTED' && offer.status !== 'REJECTED' && (
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => setShowChat(showChat === offer.id ? null : offer.id)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          {showChat === offer.id ? 'Hide Chat' : 'Chat'}
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Agency Dashboard
function AgencyDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOfferForm, setShowOfferForm] = useState<string | null>(null);
  const [offerFormData, setOfferFormData] = useState({
    carModel: '',
    carType: 'Sedan',
    dailyRate: '',
  });

  useEffect(() => {
    const allRequests = getRequestsFromStorage();
    const openOrNegotiating = allRequests.filter((r: Request) => r.status === 'OPEN' || r.status === 'NEGOTIATING');
    setRequests(openOrNegotiating);
    if (user) {
      setOffers(getOffersByAgencyId(user.id));
    }
  }, [user]);

  const handleSubmitOffer = (requestId: string) => {
    if (!user) return;

    const newOffer = createOfferInStorage({
      requestId,
      agencyId: user.id,
      carModel: offerFormData.carModel,
      carType: offerFormData.carType,
      dailyRate: parseFloat(offerFormData.dailyRate),
    });

    setOffers([...offers, newOffer]);
    setShowOfferForm(null);
    setOfferFormData({ carModel: '', carType: 'Sedan', dailyRate: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'NEGOTIATING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED').length;
  const pendingOffers = offers.filter(o => o.status === 'PENDING' || o.status === 'NEGOTIATING').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Agency Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              {user?.companyName || `${user?.firstName} ${user?.lastName}`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Total Offers</p>
                  <p className="text-3xl font-bold text-slate-900">{totalOffers}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-slate-900">{pendingOffers}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">Accepted</p>
                  <p className="text-3xl font-bold text-slate-900">{acceptedOffers}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* My Offers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">My Offers</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {offers.length === 0 ? (
                <div className="p-12 text-center">
                  <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No offers submitted yet</p>
                </div>
              ) : (
                offers.map((offer: Offer) => {
                  const request = getRequestsFromStorage().find((r: Request) => r.id === offer.requestId);
                  return (
                    <div key={offer.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                              {offer.status}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900">{offer.carModel}</h3>
                          <p className="text-sm text-slate-500">
                            {request?.pickupLocation} &rarr; {request?.dropoffLocation}
                          </p>
                          <p className="text-lg font-bold text-slate-900 mt-2">
                            ${offer.finalRate || offer.dailyRate}/day
                          </p>
                        </div>
                        {offer.status !== 'ACCEPTED' && offer.status !== 'REJECTED' && (
                          <Link
                            to={`/agency/chat/${offer.id}`}
                            className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg font-medium hover:bg-sky-200 transition-colors"
                          >
                            View Chat
                          </Link>
                        )}
                        {offer.status === 'ACCEPTED' && (
                          <div className="text-right">
                            <p className="text-sm text-emerald-600 font-medium">Booking Confirmed!</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Pickup: {request ? new Date(request.pickupDate).toLocaleDateString() : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Available Requests */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Available Requests</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No open requests at the moment</p>
                </div>
              ) : (
                requests.map((request: Request) => (
                  <div key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <MapPin className="w-4 h-4 text-sky-500" />
                          <span className="font-medium text-slate-900">
                            {request.pickupLocation} &rarr; {request.dropoffLocation}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Car Type:</span>
                            <span className="ml-2 text-slate-900">{request.carType}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Budget:</span>
                            <span className="ml-2 text-slate-900">${request.budget}/day</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Dates:</span>
                            <span className="ml-2 text-slate-900">
                              {new Date(request.pickupDate).toLocaleDateString()} - {new Date(request.dropoffDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {showOfferForm === request.id ? (
                        <div className="ml-4 w-80 bg-slate-50 rounded-xl p-4">
                          <h4 className="font-medium text-slate-900 mb-3">Make an Offer</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={offerFormData.carModel}
                              onChange={(e) => setOfferFormData({ ...offerFormData, carModel: e.target.value })}
                              placeholder="Car Model"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                            <select
                              value={offerFormData.carType}
                              onChange={(e) => setOfferFormData({ ...offerFormData, carType: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            >
                              <option value="Sedan">Sedan</option>
                              <option value="SUV">SUV</option>
                              <option value="Truck">Truck</option>
                              <option value="Van">Van</option>
                              <option value="Sports Car">Sports Car</option>
                              <option value="Luxury">Luxury</option>
                            </select>
                            <input
                              type="number"
                              value={offerFormData.dailyRate}
                              onChange={(e) => setOfferFormData({ ...offerFormData, dailyRate: e.target.value })}
                              placeholder="Daily Rate ($)"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSubmitOffer(request.id)}
                                className="flex-1 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => setShowOfferForm(null)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowOfferForm(request.id)}
                          className="ml-4 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
                        >
                          Make Offer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agency Chat Page
function AgencyChat() {
  const { user } = useAuth();
  const { offerId } = useParams();
  const [offer, setOffer] = useState<Offer | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);

  useEffect(() => {
    if (offerId) {
      const offers = getOffersFromStorage();
      setOffer(offers.find((o: Offer) => o.id === offerId));
      setMessages(getMessagesByOfferId(offerId));
    }
  }, [offerId]);

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Offer not found</p>
          <Link to="/agency" className="text-sky-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const request = getRequestsFromStorage().find((r: Request) => r.id === offer.requestId);
  const agency = user;

  const handleSendMessage = () => {
    if (!messageInput.trim() || !user) return;

    const newMessage: Message = {
      id: generateId(),
      offerId: offer.id,
      senderId: user.id,
      content: messageInput,
      isPriceProposal: false,
      createdAt: new Date().toISOString(),
    };

    createMessageInStorage({
      offerId: offer.id,
      senderId: user.id,
      content: messageInput,
      isPriceProposal: false,
    });

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const handleSendPriceProposal = () => {
    if (!priceInput.trim() || !user) return;

    const newMessage: Message = {
      id: generateId(),
      offerId: offer.id,
      senderId: user.id,
      content: `Price Proposal: $${priceInput}`,
      isPriceProposal: true,
      createdAt: new Date().toISOString(),
    };

    createMessageInStorage({
      offerId: offer.id,
      senderId: user.id,
      content: newMessage.content,
      isPriceProposal: true,
    });

    updateOfferInStorage(offer.id, { finalRate: parseFloat(priceInput) });
    setOffer({ ...offer, finalRate: parseFloat(priceInput) });

    setMessages([...messages, newMessage]);
    setPriceInput('');
    setShowPriceInput(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/agency" className="text-sky-600 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Offer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{offer.carModel}</h2>
                  <p className="text-slate-600">
                    {request?.pickupLocation} &rarr; {request?.dropoffLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    ${offer.finalRate || offer.dailyRate}/day
                  </p>
                  <p className={`text-sm ${
                    offer.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {offer.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Start the conversation!</p>
              ) : (
                messages.map((msg: Message) => {
                  const sender = getUserById(msg.senderId);
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-xl ${
                        msg.isPriceProposal
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                          : isOwn
                            ? 'bg-sky-500 text-white'
                            : 'bg-white text-slate-900 border border-slate-200'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-sky-100' : 'text-slate-500'}`}>
                          {sender?.firstName} - {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            {offer.status !== 'ACCEPTED' && offer.status !== 'REJECTED' && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                {showPriceInput ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="Enter new price"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                    />
                    <button
                      onClick={handleSendPriceProposal}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Send Price
                    </button>
                    <button
                      onClick={() => setShowPriceInput(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setShowPriceInput(true)}
                      className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                    >
                      Propose Price
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Bell Component
function NotificationBell({ userId, userRole }: { userId: string; userRole: string }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; read: boolean }[]>([]);

  useEffect(() => {
    const notifs: { id: string; text: string; time: string; read: boolean }[] = [];

    if (userRole === 'CLIENT') {
      const requests = getRequestsByClientId(userId);
      requests.forEach((req: Request) => {
        const offers = getOffersByRequestId(req.id);
        offers.forEach((offer: Offer) => {
          const agency = getUserById(offer.agencyId);
          const agencyName = agency?.companyName || `${agency?.firstName} ${agency?.lastName}`;
          if (offer.status === 'PENDING') {
            notifs.push({
              id: offer.id,
              text: `New offer from ${agencyName} for ${offer.carModel} at $${offer.dailyRate}/day`,
              time: offer.createdAt,
              read: false,
            });
          }
          if (offer.status === 'ACCEPTED') {
            notifs.push({
              id: offer.id + '-accepted',
              text: `Booking confirmed with ${agencyName} for ${offer.carModel}`,
              time: offer.createdAt,
              read: true,
            });
          }
        });
      });
    } else {
      const offers = getOffersByAgencyId(userId);
      offers.forEach((offer: Offer) => {
        const msgs = getMessagesByOfferId(offer.id);
        const clientMsgs = msgs.filter((m: Message) => m.senderId !== userId);
        if (clientMsgs.length > 0) {
          const lastMsg = clientMsgs[clientMsgs.length - 1];
          notifs.push({
            id: lastMsg.id,
            text: lastMsg.isPriceProposal
              ? `Client sent a price proposal: ${lastMsg.content}`
              : `New message on ${offer.carModel}`,
            time: lastMsg.createdAt,
            read: false,
          });
        }
        if (offer.status === 'ACCEPTED') {
          notifs.push({
            id: offer.id + '-deal',
            text: `Deal accepted for ${offer.carModel}!`,
            time: offer.createdAt,
            read: true,
          });
        }
      });
    }

    notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(notifs.slice(0, 10));
  }, [userId, userRole]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 hover:text-sky-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    !notif.read ? 'bg-sky-50' : ''
                  }`}
                >
                  <p className="text-sm text-slate-700">{notif.text}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.time).toLocaleDateString()} at {new Date(notif.time).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Profile Page
function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    nationality: user?.nationality || '',
    companyName: user?.companyName || '',
  });
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/auth/signin" replace />;

  const handleSave = () => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...formData };
      saveToStorage(STORAGE_KEYS.USERS, users);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));
    }
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Stats
  let stats: { label: string; value: number }[] = [];
  if (user.role === 'CLIENT') {
    const requests = getRequestsByClientId(user.id);
    stats = [
      { label: 'Total Requests', value: requests.length },
      { label: 'Active', value: requests.filter(r => r.status === 'OPEN' || r.status === 'NEGOTIATING').length },
      { label: 'Completed', value: requests.filter(r => r.status === 'BOOKED' || r.status === 'COMPLETED').length },
    ];
  } else {
    const offers = getOffersByAgencyId(user.id);
    stats = [
      { label: 'Total Offers', value: offers.length },
      { label: 'Accepted', value: offers.filter(o => o.status === 'ACCEPTED').length },
      { label: 'Pending', value: offers.filter(o => o.status === 'PENDING' || o.status === 'NEGOTIATING').length },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

          {saved && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 h-32 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-sky-600">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
                  {user.companyName && (
                    <p className="text-sky-600 font-medium">{user.companyName}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'CLIENT' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Nationality</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.nationality}</p>
                )}
              </div>
              {user.role === 'AGENCY' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user.companyName}</p>
                  )}
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                <p className="text-slate-900 font-medium">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
                <p className="text-slate-900 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">
              Logging out will end your current session.
            </p>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Confirmation Page
function BookingConfirmation() {
  const { user } = useAuth();
  const { offerId } = useParams();

  if (!user || !offerId) return <Navigate to="/dashboard" replace />;

  const offers = getOffersFromStorage();
  const offer = offers.find((o: Offer) => o.id === offerId);
  if (!offer || offer.status !== 'ACCEPTED') return <Navigate to="/dashboard" replace />;

  const request = getRequestsFromStorage().find((r: Request) => r.id === offer.requestId);
  const agency = getUserById(offer.agencyId);
  const agencyName = agency?.companyName || `${agency?.firstName} ${agency?.lastName}`;

  const pickupDate = request ? new Date(request.pickupDate) : new Date();
  const dropoffDate = request ? new Date(request.dropoffDate) : new Date();
  const days = Math.max(1, Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalCost = (offer.finalRate || offer.dailyRate) * days;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
            <p className="text-slate-600 mt-2">Your car rental has been successfully booked</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50 to-emerald-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{offer.carModel}</h2>
                  <p className="text-slate-600">{offer.carType} • {agencyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">${offer.finalRate || offer.dailyRate}/day</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Pickup</label>
                  <p className="font-medium text-slate-900">{request?.pickupLocation}</p>
                  <p className="text-sm text-slate-600">{pickupDate.toLocaleDateString()} at {pickupDate.toLocaleTimeString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Drop-off</label>
                  <p className="font-medium text-slate-900">{request?.dropoffLocation}</p>
                  <p className="text-sm text-slate-600">{dropoffDate.toLocaleDateString()} at {dropoffDate.toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Daily Rate</span>
                  <span className="text-slate-900">${offer.finalRate || offer.dailyRate}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-600">Duration</span>
                  <span className="text-slate-900">{days} day{days > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-3 pt-3 border-t border-slate-100">
                  <span className="text-slate-900">Total</span>
                  <span className="text-emerald-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-sky-50 rounded-xl p-4 mt-4">
                <h4 className="font-medium text-sky-800 mb-2">Agency Contact</h4>
                <p className="text-sm text-sky-700">{agencyName}</p>
                <p className="text-sm text-sky-700">{agency?.phone}</p>
                <p className="text-sm text-sky-700">{agency?.email}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center space-x-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
function AppContent() {
  const { isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const hideHeader = ['/auth/signin', '/auth/signup'].includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/request/:id"
          element={
            <ProtectedRoute>
              <ClientRequestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agency"
          element={
            <ProtectedRoute>
              <AgencyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agency/chat/:offerId"
          element={
            <ProtectedRoute>
              <AgencyChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:offerId"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  initializeDatabase();

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
