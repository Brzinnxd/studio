'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useFirebase, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile, Customer } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, isUserLoading: isAuthLoading } = useFirebase();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user is new, their profile might not exist yet.
        const userProfileRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userProfileRef);
        if (!docSnap.exists()) {
          // This is a new user (likely from Google Sign-In), create their profile.
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Novo Usuário',
            photoURL: user.photoURL || '',
            isAdmin: user.email === 'arthur.vieirask@gmail.com',
          };
          await setDoc(userProfileRef, newUserProfile);

          const customerDocRef = doc(firestore, 'customers', user.uid);
          const [firstName, ...lastNameParts] = (user.displayName || 'Novo Usuário').split(' ');
          const newCustomer: Customer = {
            id: user.uid,
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            address: '',
          };
          await setDoc(customerDocRef, newCustomer);
        }
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    if (newUser && firestore) {
      const userProfileDocRef = doc(firestore, 'users', newUser.uid);
      const newUserProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        displayName: displayName,
        photoURL: newUser.photoURL || '',
        isAdmin: email === 'arthur.vieirask@gmail.com',
      };
      await setDoc(userProfileDocRef, newUserProfile);

      // Also create a customer document
      const customerDocRef = doc(firestore, 'customers', newUser.uid);
      const [firstName, ...lastNameParts] = displayName.split(' ');
      const newCustomer: Customer = {
          id: newUser.uid,
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: newUser.email || '',
          phone: newUser.phoneNumber || '',
          address: '',
      };
      await setDoc(customerDocRef, newCustomer);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isLoading = isAuthLoading || (!!user && isProfileLoading);

  const value = {
    user,
    userProfile: userProfile ?? null,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    