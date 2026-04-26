import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileRef = doc(db, 'users', user.uid);
    
    // Initial fetch and setup if missing
    const setupProfile = async () => {
        try {
            const snap = await getDoc(profileRef);
            if (!snap.exists()) {
                const newProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || 'Soldier',
                    photoURL: user.photoURL || '',
                    prepProgress: {},
                    overallProgress: 0,
                };
                await setDoc(profileRef, newProfile);
            }
        } catch (err) {
            console.error("Profile setup failed:", err);
            setLoading(false); // Stop loading if it fails so user isn't stuck
        }
    };

    setupProfile();

    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  return { profile, loading };
}
