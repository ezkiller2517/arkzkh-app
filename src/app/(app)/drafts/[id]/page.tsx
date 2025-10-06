'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Sparkles, FileUp, Paperclip, Image as ImageIcon, Video, File as FileIcon, Trash2 } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Draft, Attachment } from '@/lib/types';
import { scoreContentAlignment } from '@/ai/flows/score-content-alignment';
import type { ScoreContentAlignmentOutput } from '@/ai/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { serverTimestamp } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contentTemplates } from '@/lib/templates';
import { useFirebase } from '@/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function DraftEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getDraft, saveDraft, userData, submitDraft, approveDraft, rejectDraft, blueprint } = useApp();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const id = params.id;

  const [draft, setDraft] = useState<Partial<Draft> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiResult, setAiResult] = useState<ScoreContentAlignmentOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (id === 'new') {
      setDraft({ id: uuidv4(), title: '', content: '', status: 'Draft', attachments: [] });
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
            justification: existingDraft.justification || '',
          });
        }
      } else {
        // Data might still be loading
      }
    }
  }, [id, getDraft]);
  
  const handleTemplateChange = (templateId: string) => {
    const template = contentTemplates[templateId];
    if (template) {
      setDraft(d => d ? { ...d, content: template.content } : null);
    }
  };

  const handleSave = async () => {
    if (!draft?.id || !draft.title) {
        toast({ title: 'Title is required', variant: 'destructive' });
        return;
    };
    setIsSaving(true);
    const draftData: Partial<Draft> & {id: string} = {
        id: draft.id,
        title: draft.title,
        content: draft.content,
        author: userData?.displayName || 'Unknown Author',
        status: draft.status || 'Draft',
        createdAt: draft.createdAt || serverTimestamp(),
        attachments: draft.attachments || [],
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
                rationale: result.rationale,
                justification: result.justification
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    if (!draft?.id || !userData?.organizationId) {
        toast({ title: 'Cannot upload file', description: 'Draft or organization not properly loaded.', variant: 'destructive' });
        return;
    }

    const file = event.target.files[0];
    setIsUploading(true);
    setUploadProgress(0);

    const filePath = `organizations/${userData.organizationId}/drafts/${draft.id}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileStorageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("File upload error:", error);
        toast({ title: 'Upload Failed', description: 'Could not upload the file.', variant: 'destructive' });
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newAttachment: Attachment = {
          name: file.name,
          url: downloadURL,
          type: file.type,
        };
        
        const updatedAttachments = [...(draft.attachments || []), newAttachment];
        setDraft(d => d ? { ...d, attachments: updatedAttachments } : null);
        
        saveDraft({ id: draft.id!, attachments: updatedAttachments });

        toast({ title: 'File Uploaded', description: `${file.name} has been attached.` });

        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const handleRemoveAttachment = (url: string) => {
    if (!draft?.id) return;

    const updatedAttachments = draft.attachments?.filter(att => att.url !== url) || [];
    setDraft(d => d ? { ...d, attachments: updatedAttachments } : null);
    saveDraft({ id: draft.id, attachments: updatedAttachments });
     toast({ title: 'Attachment Removed' });
  }

  if (!draft) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const canEdit = userData?.role === 'Admin' || (userData?.role === 'Approver' && draft.status === 'In Review') || (userData?.role === 'Contributor' && draft.status === 'Draft');

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
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
         <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Draft title..."
            value={draft.title || ''}
            onChange={e => setDraft(d => d ? { ...d, title: e.target.value } : null)}
            className="text-xl font-semibold flex-grow"
            disabled={!canEdit}
          />
          <Select onValueChange={handleTemplateChange} disabled={!canEdit}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(contentTemplates).map(([id, { name }]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Start writing your content here..."
          value={draft.content || ''}
          onChange={e => setDraft(d => d ? { ...d, content: e.target.value } : null)}
          className="min-h-[50vh] text-base"
          disabled={!canEdit}
        />
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Attachments</h2>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={!canEdit || isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                    Upload Media
                </Button>
            </div>
            {isUploading && (
                <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">{`Uploading... ${Math.round(uploadProgress)}%`}</p>
                </div>
            )}
            {draft.attachments && draft.attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {draft.attachments.map((file, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                             {file.type.startsWith('image/') ? (
                                <img src={file.url} alt={file.name} className="h-32 w-full object-cover" />
                            ) : file.type.startsWith('video/') ? (
                                <div className="h-32 w-full bg-black flex items-center justify-center">
                                    <Video className="h-10 w-10 text-white" />
                                </div>
                            ) : (
                                <div className="h-32 w-full bg-muted flex items-center justify-center">
                                     <FileIcon className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}
                             <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-xs truncate">
                                {file.name}
                            </div>
                            {canEdit && (
                                <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleRemoveAttachment(file.url)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg">
                    <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No files attached yet.</p>
                </div>
            )}
        </div>
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
                            {aiResult.justification && <p className="text-sm text-muted-foreground italic mt-2">"{aiResult.justification}"</p>}
                        </div>
                        <Accordion type="single" collapsible className="w-full" defaultValue="suggestions">
                            <AccordionItem value="suggestions">
                                <AccordionTrigger>Actionable Suggestions</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-4 space-y-2 text-sm">
                                        {aiResult.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="rationale">
                                <AccordionTrigger>Detailed Rationale</AccordionTrigger>
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
