'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { UserRole, StrategicBlueprint, Draft, DraftStatus } from '@/lib/types';
import { initialDrafts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
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
  const [role, setRole] = useState<UserRole>('Contributor');
  const [blueprint, setBlueprint] = useState<StrategicBlueprint | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const { toast } = useToast();

  const getDraft = useCallback((id: string) => drafts.find(d => d.id === id), [drafts]);

  const saveDraft = useCallback((draftUpdate: Partial<Draft> & { id: string }) => {
    setDrafts(prevDrafts => {
      const existingDraft = prevDrafts.find(d => d.id === draftUpdate.id);
      if (existingDraft) {
        return prevDrafts.map(d =>
          d.id === draftUpdate.id ? { ...d, ...draftUpdate, updatedAt: new Date().toISOString() } : d
        );
      } else {
        const newDraft: Draft = {
          title: '',
          content: '',
          status: 'Draft',
          author: 'Current User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...draftUpdate,
        };
        return [...prevDrafts, newDraft];
      }
    });
     toast({
        title: "Draft Saved",
        description: `Draft "${draftUpdate.title || 'Untitled'}" has been saved.`,
      });
  }, [toast]);

  const updateDraftStatus = useCallback((id: string, status: DraftStatus, message: string) => {
     setDrafts(prev => prev.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d));
      const draft = drafts.find(d => d.id === id);
       if (draft) {
        toast({
            title: message,
            description: `Draft "${draft.title}" is now ${status}.`,
        });
       }
  }, [drafts, toast]);

  const submitDraft = useCallback((id: string) => updateDraftStatus(id, 'In Review', 'Draft Submitted'), [updateDraftStatus]);
  const approveDraft = useCallback((id:string) => updateDraftStatus(id, 'Approved', 'Draft Approved'), [updateDraftStatus]);
  const rejectDraft = useCallback((id: string) => updateDraftStatus(id, 'Rejected', 'Draft Rejected'), [updateDraftStatus]);

  const value = {
    role,
    setRole,
    blueprint,
    setBlueprint,
    drafts,
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
