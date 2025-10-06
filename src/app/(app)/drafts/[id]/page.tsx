'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Draft } from '@/lib/types';
import { scoreContentAlignment } from '@/ai/flows/score-content-alignment';
import type { ScoreContentAlignmentOutput } from '@/ai/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { serverTimestamp } from 'firebase/firestore';

export default function DraftEditorPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { getDraft, saveDraft, userData, submitDraft, approveDraft, rejectDraft, blueprint } = useApp();
  const { toast } = useToast();

  const [draft, setDraft] = useState<Partial<Draft> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [aiResult, setAiResult] = useState<ScoreContentAlignmentOutput | null>(null);

  useEffect(() => {
    if (id === 'new') {
      setDraft({ id: uuidv4(), title: '', content: '', status: 'Draft' });
    } else {
      const existingDraft = getDraft(id);
      if (existingDraft) {
        setDraft(existingDraft);
        if(existingDraft.alignmentScore) {
          setAiResult({
            alignmentScore: existingDraft.alignmentScore,
            feedback: existingDraft.feedback || '',
            suggestedActions: existingDraft.suggestions || [],
            rationale: existingDraft.rationale || '',
          });
        }
      } else {
        // Data might still be loading, don't toast immediately
        // toast({ title: 'Draft not found', variant: 'destructive' });
        // router.push('/drafts');
      }
    }
  }, [id, getDraft, router, toast]);

  const handleSave = async () => {
    if (!draft?.id || !draft.title) {
        toast({ title: 'Title is required', variant: 'destructive' });
        return;
    };
    setIsSaving(true);
    const draftData = {
        id: draft.id,
        title: draft.title,
        content: draft.content,
        author: userData?.displayName || 'Unknown Author',
        status: draft.status || 'Draft',
        createdAt: draft.createdAt || serverTimestamp()
    }
    saveDraft(draftData);
    setIsSaving(false);
    if (id === 'new') {
        router.replace(`/drafts/${draft.id}`);
    }
  };

  const handleScoreAlignment = async () => {
    if (!blueprint) {
        toast({ title: 'Strategic Blueprint not set', description: 'Please set the blueprint before scoring.', variant: 'destructive'});
        return;
    }
    if (!draft?.content) {
        toast({ title: 'Content is empty', description: 'Write some content before scoring.', variant: 'destructive'});
        return;
    }

    setIsScoring(true);
    setAiResult(null);

    try {
        const result = await scoreContentAlignment({
            content: draft.content,
            strategicBlueprint: JSON.stringify(blueprint),
        });
        setAiResult(result);
        if (draft.id) {
            saveDraft({
                id: draft.id,
                alignmentScore: result.alignmentScore,
                feedback: result.feedback,
                suggestions: result.suggestedActions,
                rationale: result.rationale
            });
        }
        toast({ title: 'Scoring Complete', description: `Alignment score: ${(result.alignmentScore * 100).toFixed(0)}%`});
    } catch (error) {
        console.error(error);
        toast({ title: 'Scoring Failed', variant: 'destructive' });
    } finally {
        setIsScoring(false);
    }
  }

  if (!draft) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const canEdit = userData?.role === 'Admin' || (userData?.role === 'Approver' && draft.status === 'In Review') || (userData?.role === 'Contributor' && draft.status === 'Draft');

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight font-headline">Draft Editor</h1>
            <div className="flex items-center gap-2">
                {userData?.role === 'Contributor' && draft.status === 'Draft' && <Button onClick={() => draft.id && submitDraft(draft.id)}>Submit for Review</Button>}
                { (userData?.role === 'Approver' || userData?.role === 'Admin') && draft.status === 'In Review' && (
                    <>
                        <Button variant="destructive" onClick={() => draft.id && rejectDraft(draft.id, 'Needs improvement')}>Reject</Button>
                        <Button onClick={() => draft.id && approveDraft(draft.id)}>Approve</Button>
                    </>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Draft
                </Button>
            </div>
        </div>
        <Input
          placeholder="Draft title..."
          value={draft.title || ''}
          onChange={e => setDraft(d => d ? { ...d, title: e.target.value } : null)}
          className="text-xl font-semibold"
          disabled={!canEdit}
        />
        <Textarea
          placeholder="Start writing your content here..."
          value={draft.content || ''}
          onChange={e => setDraft(d => d ? { ...d, content: e.target.value } : null)}
          className="min-h-[60vh] text-base"
          disabled={!canEdit}
        />
      </div>
      <div className="w-full lg:w-[400px] lg:min-w-[400px] lg:max-h-screen lg:overflow-y-auto border-l bg-muted/20 p-4 md:p-6 sticky top-0">
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Alignment Analysis</CardTitle>
                <CardDescription>Score your content against the strategic blueprint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleScoreAlignment} disabled={isScoring} className="w-full">
                    {isScoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Score Content Alignment
                </Button>

                {isScoring && <div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /><span>Analyzing...</span></div>}

                {aiResult && (
                    <div className="space-y-4 pt-4">
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold">Alignment Score</h3>
                                <span className="font-bold text-primary text-lg">{(aiResult.alignmentScore * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={aiResult.alignmentScore * 100} />
                        </div>
                        <Accordion type="single" collapsible className="w-full" defaultValue="feedback">
                            <AccordionItem value="feedback">
                                <AccordionTrigger>Feedback</AccordionTrigger>
                                <AccordionContent className="text-sm">{aiResult.feedback}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="suggestions">
                                <AccordionTrigger>Suggested Actions</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-4 space-y-2 text-sm">
                                        {aiResult.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="rationale">
                                <AccordionTrigger>Rationale</AccordionTrigger>
                                <AccordionContent className="text-sm">{aiResult.rationale}</AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
