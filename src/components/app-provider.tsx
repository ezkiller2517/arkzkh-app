'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import type { UserData, StrategicBlueprint, Draft, DraftStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface AppContextType {
  userData: UserData | null;
  setUserData: (user: UserData) => void;
  blueprint: StrategicBlueprint | null;
  setBlueprint: (blueprint: StrategicBlueprint | null) => void;
  drafts: Draft[];
  getDraft: (id: string) => Draft | undefined;
  saveDraft: (draft: Partial<Draft> & { id: string }) => void;
  submitDraft: (id: string) => void;
  approveDraft: (id: string) => void;
  rejectDraft: (id: string, feedback: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const draftsColRef = useMemoFirebase(() => (firestore && userData?.organizationId) ? collection(firestore, 'organizations', userData.organizationId, 'contentObjects') : null, [firestore, userData]);
  const { data: drafts, isLoading: areDraftsLoading } = useCollection<Draft>(draftsColRef);
  
  const [blueprint, setBlueprint] = useState<StrategicBlueprint | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (!isUserLoading && user && !isUserDataLoading && !userData) {
      router.push('/setup');
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router]);


  const setUserData = useCallback((newUserData: UserData) => {
    if (userDocRef) {
      setDocumentNonBlocking(userDocRef, newUserData, { merge: true });
    }
  }, [userDocRef]);


  const getDraft = useCallback((id: string) => drafts?.find(d => d.id === id), [drafts]);

  const saveDraft = useCallback((draftUpdate: Partial<Draft> & { id: string }) => {
    if (!draftsColRef) return;
    const docRef = doc(draftsColRef, draftUpdate.id);
    setDocumentNonBlocking(docRef, { ...draftUpdate, updatedAt: serverTimestamp() }, { merge: true });
     toast({
        title: "Draft Saved",
        description: `Draft "${draftUpdate.title || 'Untitled'}" has been saved.`,
      });
  }, [draftsColRef, toast]);

  const updateDraftStatus = useCallback((id: string, status: DraftStatus, message: string) => {
     if (!draftsColRef) return;
     const docRef = doc(draftsColRef, id);
     updateDocumentNonBlocking(docRef, { status, updatedAt: serverTimestamp() });
     const draft = drafts?.find(d => d.id === id);
       if (draft) {
        toast({
            title: message,
            description: `Draft "${draft.title}" is now ${status}.`,
        });
       }
  }, [drafts, draftsColRef, toast]);

  const submitDraft = useCallback((id: string) => updateDraftStatus(id, 'In Review', 'Draft Submitted'), [updateDraftStatus]);
  const approveDraft = useCallback((id:string) => updateDraftStatus(id, 'Approved', 'Draft Approved'), [updateDraftStatus]);
  const rejectDraft = useCallback((id: string) => updateDraftStatus(id, 'Rejected', 'Draft Rejected'), [updateDraftStatus]);

  const value = {
    userData: userData || null,
    setUserData,
    blueprint,
    setBlueprint,
    drafts: drafts || [],
    getDraft,
    saveDraft,
    submitDraft,
    approveDraft,
    rejectDraft,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
