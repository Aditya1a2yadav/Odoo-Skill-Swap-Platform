
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  onAuthStateChanged,
  type User,
  type UserCredential
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>; 
  signup: (email: string, pass: string, name: string) => Promise<UserCredential>; 
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE_IMAGE = 'https://icons.veryicon.com/png/o/miscellaneous/icon-icon-of-ai-intelligent-dispensing/login-user-name-1.png';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      if(newUser) {
          await updateProfile(newUser, { 
            displayName,
            photoURL: DEFAULT_PROFILE_IMAGE,
          });

          // Create a document for the user in the 'users' collection
          const userDocRef = doc(db, 'users', newUser.uid);
          await setDoc(userDocRef, {
            name: displayName,
            email: newUser.email,
            profilePhotoUrl: DEFAULT_PROFILE_IMAGE,
            location: '',
            skillsOffered: [],
            skillsWanted: [],
            availability: [],
            isProfilePublic: false,
            rating: { average: 0, count: 0 },
          });

          setUser({ ...newUser, displayName, photoURL: DEFAULT_PROFILE_IMAGE }); 
      }
      return userCredential;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error; 
    }
  };

  const login = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
