'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, addDoc, serverTimestamp, query, limit, getDocs } from 'firebase/firestore';
import type { UserData, StrategicBlueprint, Draft, DraftStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  userData: UserData | null;
  setUserData: (user: UserData) => void;
  blueprint: StrategicBlueprint | null;
  setBlueprint: (blueprint: StrategicBlueprint | null) => void;
  saveBlueprint: (blueprint: StrategicBlueprint) => void;
  drafts: Draft[];
  getDraft: (id: string) => Draft | undefined;
  updateDraftStatus: (id: string, status: DraftStatus, message: string) => void;
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

  // Fetch blueprint
  useEffect(() => {
    const fetchBlueprint = async () => {
        if (firestore && userData?.organizationId) {
            const blueprintColRef = collection(firestore, 'organizations', userData.organizationId, 'strategicBlueprints');
            // Assuming there's only one blueprint, we fetch the first one.
            const q = query(blueprintColRef, limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const blueprintDoc = snapshot.docs[0];
                setBlueprint({ id: blueprintDoc.id, ...blueprintDoc.data() } as StrategicBlueprint);
            }
        }
    };
    fetchBlueprint();
  }, [firestore, userData?.organizationId]);


  const setUserData = useCallback((newUserData: UserData) => {
    if (userDocRef) {
      setDocumentNonBlocking(userDocRef, newUserData, { merge: true });
    }
  }, [userDocRef]);

  const saveBlueprint = useCallback((blueprintToSave: StrategicBlueprint) => {
    if (!firestore || !userData?.organizationId) return;
    
    const blueprintId = blueprintToSave.id || blueprint?.id || uuidv4();
    const blueprintRef = doc(firestore, 'organizations', userData.organizationId, 'strategicBlueprints', blueprintId);

    const dataToSet = { ...blueprintToSave, id: blueprintId, updatedAt: serverTimestamp() };

    setDocumentNonBlocking(blueprintRef, dataToSet, { merge: true });
  }, [firestore, userData?.organizationId, blueprint?.id]);


  const getDraft = useCallback((id: string) => drafts?.find(d => d.id === id), [drafts]);

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
    saveBlueprint,
    drafts: drafts || [],
    getDraft,
    updateDraftStatus,
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
