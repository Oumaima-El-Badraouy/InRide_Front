// Database utility using localStorage for InRide
// This simulates a database for demonstration purposes

import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
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

export interface Request {
  id: string;
  clientId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  carType: string;
  budget: number;
  additionalNotes?: string;
  status: 'OPEN' | 'NEGOTIATING' | 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
}

export interface Offer {
  id: string;
  requestId: string;
  agencyId: string;
  carModel: string;
  carType: string;
  carImageUrl?: string;
  dailyRate: number;
  finalRate?: number;
  status: 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Message {
  id: string;
  offerId: string;
  senderId: string;
  content: string;
  isPriceProposal: boolean;
  createdAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'inride_users',
  REQUESTS: 'inride_requests',
  OFFERS: 'inride_offers',
  MESSAGES: 'inride_messages',
  CURRENT_USER: 'inride_current_user',
};

// Helper functions
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize with sample data if empty
export function initializeDatabase(): void {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  if (users.length === 0) {
    // Create sample agencies
    const sampleAgencies: User[] = [
      {
        id: uuidv4(),
        email: 'elite@example.com',
        password: 'password123',
        role: 'AGENCY',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1 555-0101',
        nationality: 'USA',
        companyName: 'Elite Car Rental',
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        email: 'swift@example.com',
        password: 'password123',
        role: 'AGENCY',
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1 555-0102',
        nationality: 'Spain',
        companyName: 'Swift Wheels',
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        email: 'premium@example.com',
        password: 'password123',
        role: 'AGENCY',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+1 555-0103',
        nationality: 'UAE',
        companyName: 'Premium Drive',
        createdAt: new Date().toISOString(),
      },
    ];
    saveToStorage(STORAGE_KEYS.USERS, sampleAgencies);
  }
}

// User functions
export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function getUserByEmail(email: string): User | undefined {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find((u) => u.id === id);
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  }
  return undefined;
}

// Auth functions
export function login(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

// Request functions
export function createRequest(requestData: Omit<Request, 'id' | 'createdAt' | 'status'>): Request {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  const newRequest: Request = {
    ...requestData,
    id: uuidv4(),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  return newRequest;
}

export function getRequests(): Request[] {
  return getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
}

export function getRequestById(id: string): Request | undefined {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  return requests.find((r) => r.id === id);
}

export function getRequestsByClientId(clientId: string): Request[] {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  return requests.filter((r) => r.clientId === clientId);
}

export function getOpenRequests(): Request[] {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  return requests.filter((r) => r.status === 'OPEN');
}

export function updateRequest(id: string, updates: Partial<Request>): Request | undefined {
  const requests = getFromStorage<Request>(STORAGE_KEYS.REQUESTS);
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
    return requests[index];
  }
  return undefined;
}

// Offer functions
export function createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>): Offer {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  const newOffer: Offer = {
    ...offerData,
    id: uuidv4(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  offers.push(newOffer);
  saveToStorage(STORAGE_KEYS.OFFERS, offers);

  // Update request status to NEGOTIATING
  updateRequest(offerData.requestId, { status: 'NEGOTIATING' });

  return newOffer;
}

export function getOffers(): Offer[] {
  return getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
}

export function getOfferById(id: string): Offer | undefined {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  return offers.find((o) => o.id === id);
}

export function getOffersByRequestId(requestId: string): Offer[] {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  return offers.filter((o) => o.requestId === requestId);
}

export function getOffersByAgencyId(agencyId: string): Offer[] {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  return offers.filter((o) => o.agencyId === agencyId);
}

export function updateOffer(id: string, updates: Partial<Offer>): Offer | undefined {
  const offers = getFromStorage<Offer>(STORAGE_KEYS.OFFERS);
  const index = offers.findIndex((o) => o.id === id);
  if (index !== -1) {
    offers[index] = { ...offers[index], ...updates };
    saveToStorage(STORAGE_KEYS.OFFERS, offers);
    return offers[index];
  }
  return undefined;
}

// Message functions
export function createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Message {
  const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
  const newMessage: Message = {
    ...messageData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  saveToStorage(STORAGE_KEYS.MESSAGES, messages);

  // Update offer status to NEGOTIATING if it's a price proposal
  if (messageData.isPriceProposal) {
    updateOffer(messageData.offerId, { status: 'NEGOTIATING' });
  }

  return newMessage;
}

export function getMessages(): Message[] {
  return getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
}

export function getMessagesByOfferId(offerId: string): Message[] {
  const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
  return messages.filter((m) => m.offerId === offerId).sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

// Accept offer (Done button)
export function acceptOffer(offerId: string): { success: boolean; message: string } {
  const offer = getOfferById(offerId);
  if (!offer) {
    return { success: false, message: 'Offer not found' };
  }

  const request = getRequestById(offer.requestId);
  if (!request) {
    return { success: false, message: 'Request not found' };
  }

  // Update the accepted offer
  updateOffer(offerId, { status: 'ACCEPTED', finalRate: offer.finalRate || offer.dailyRate });

  // Update the request
  updateRequest(request.id, { status: 'BOOKED' });

  // Reject all other offers for this request
  const allOffers = getOffersByRequestId(request.id);
  allOffers.forEach((o) => {
    if (o.id !== offerId) {
      updateOffer(o.id, { status: 'REJECTED' });
    }
  });

  return { success: true, message: 'Deal accepted successfully!' };
}
