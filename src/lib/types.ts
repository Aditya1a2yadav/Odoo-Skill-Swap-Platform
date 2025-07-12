// This file can be expanded with more specific types for your application.
// For now, it contains the core types related to users and skills.

import { type User as FirebaseUser } from "firebase/auth";

export type UserProfile = {
  id: string;
  name: string;
  email?: string;
  location?: string;
  profilePhotoUrl?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability?: string[];
  isProfilePublic: boolean;
  rating: { average: number; count: number };
  role?: 'user' | 'admin';
  age?: number;
};

type SwapParticipant = {
  id: string;
  name: string;
  profilePhotoUrl?: string;
}

export type SwapRequest = {
  id: string;
  requester: SwapParticipant;
  target: SwapParticipant;
  offeredSkill: string;
  requestedSkill: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string; // Keep as string for simplicity on client
};

export type Notification = {
  id: string;
  userId: string;
  type: 'swap_request' | 'swap_update' | 'system_message';
  payload: {
    message: string;
    link?: string;
  };
  read: boolean;
  createdAt: string; // Keep as string
};
