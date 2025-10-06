'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc, setDoc, writeBatch, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UserRole, UserData, StrategicBlueprint } from '@/lib/types';
import { Loader2, File as FileIcon, Link as LinkIcon, Pilcrow, Trash2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import { extractDocumentContent } from '@/ai/flows/extract-document-content';
import { extractStrategicBlueprint } from '@/ai/flows/extract-strategic-blueprint';
import { Textarea } from '@/components/ui/textarea';

type DocumentSourceType = 'text' | 'file' | 'url';
interface DocumentSource {
  id: string;
  type: DocumentSourceType;
  content: string | File;
  name: string;
}

const STEPS = [
  { id: 1, name: 'Organization' },
  { id: 2, name: 'Add Content' },
  { id: 3, name: 'Your Role' },
];

export default function SetupPage() {
  const { auth, firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [organizationName, setOrganizationName] = useState('');
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [role, setRole] = useState<UserRole>('Contributor');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAddSource = (type: DocumentSourceType) => {
    const newSource: DocumentSource = {
      id: `source_${Date.now()}`,
      type,
      content: '',
      name: `New ${type} source`,
    };
    setSources([...sources, newSource]);
  };

  const handleUpdateSource = (id: string, value: string | File, name?: string) => {
    setSources(
      sources.map(s =>
        s.id === id ? { ...s, content: value, name: name || s.name } : s
      )
    );
  };

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };
  
  const processAndExtractBlueprint = async (): Promise<StrategicBlueprint | null> => {
    if (sources.length === 0) return null;
    
    setIsExtracting(true);
    let combinedContent = '';

    try {
      for (const source of sources) {
        if (typeof source.content === 'string' && source.type === 'text') {
          combinedContent += `\n\n--- Document: ${source.name} ---\n${source.content}`;
        } else if (typeof source.content === 'string' && source.type === 'url') {
           const result = await extractDocumentContent({ document: { url: source.content } });
           combinedContent += `\n\n--- Document: ${source.name} ---\n${result.content}`;
        } else if (source.type === 'file' && typeof source.content === 'object') {
            const dataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(source.content as File);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            const result = await extractDocumentContent({ document: { data: dataUri } });
            combinedContent += `\n\n--- Document: ${source.name} ---\n${result.content}`;
        }
      }

      if (!combinedContent.trim()) {
        toast({ title: "No content found in sources", description: "Could not extract any text from the provided sources.", variant: "destructive" });
        return null;
      }
      
      const extractedBlueprint = await extractStrategicBlueprint({ documentContent: combinedContent });
      toast({ title: "Blueprint Extracted", description: "Successfully created strategic blueprint from your documents." });
      return extractedBlueprint;

    } catch (error) {
      console.error("Error extracting blueprint:", error);
      toast({ title: "Extraction Failed", description: "Could not create blueprint from the provided sources.", variant: "destructive" });
      return null;
    } finally {
      setIsExtracting(false);
    }
  }


  const handleFinalSetup = async () => {
    if (!organizationName.trim()) {
      toast({ title: "Organization name is required", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const blueprint = await processAndExtractBlueprint();
      
      const batch = writeBatch(firestore);

      // 1. Create Organization
      const orgRef = doc(collection(firestore, 'organizations'));
      batch.set(orgRef, { name: organizationName, id: orgRef.id });

      // 2. Save Strategic Blueprint if extracted
      if (blueprint) {
          const blueprintRef = doc(collection(firestore, 'organizations', orgRef.id, 'strategicBlueprints'));
          batch.set(blueprintRef, { ...blueprint, id: blueprintRef.id, createdAt: serverTimestamp() });
      }

      // 3. Update User Profile
      const userRef = doc(firestore, 'users', user.uid);
      const userData: UserData = {
        id: user.uid,
        displayName: user.displayName || 'Anonymous',
        email: user.email || '',
        photoURL: user.photoURL || '',
        organizationId: orgRef.id,
        role: role,
      };
      batch.set(userRef, userData, { merge: true });

      await batch.commit();

      toast({ title: "Setup complete!", description: `Welcome to ${organizationName}.` });
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during setup:", error);
      toast({ title: "Setup failed", description: "Could not save initial information.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));
  const progress = ((currentStep - 1) / (STEPS.length -1)) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="w-full max-w-2xl">
            <div className="mb-8">
                <Icons.Logo />
            </div>

            <Card className="w-full">
                <CardHeader>
                    <Progress value={progress} className="mb-4 h-2" />
                    <CardTitle className="text-2xl">
                        Step {currentStep}: {STEPS[currentStep - 1].name}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Let's start with the name of your organization."}
                        {currentStep === 2 && "Provide documents to generate your strategic blueprint. You can add multiple sources."}
                        {currentStep === 3 && "Almost done! Just select your role."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 min-h-[300px]">
                    {currentStep === 1 && (
                        <div className="grid gap-2">
                            <Label htmlFor="organizationName">Organization Name</Label>
                            <Input
                            id="organizationName"
                            placeholder="e.g., Acme Inc."
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Add a source:</span>
                                <Button variant="outline" size="sm" onClick={() => handleAddSource('text')}><Pilcrow className="mr-2 h-4 w-4" />Text</Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddSource('file')}><FileIcon className="mr-2 h-4 w-4" />File</Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddSource('url')}><LinkIcon className="mr-2 h-4 w-4" />URL</Button>
                            </div>
                           
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {sources.map(source => (
                                    <SourceInput key={source.id} source={source} onUpdate={handleUpdateSource} onRemove={handleRemoveSource} />
                                ))}
                            </div>
                             {isExtracting && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Extracting content... This may take a moment.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                         <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Your Role</Label>
                                <RadioGroup
                                    defaultValue="Contributor"
                                    onValueChange={(value: UserRole) => setRole(value)}
                                    className="flex space-x-4"
                                >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Contributor" id="contributor" />
                                    <Label htmlFor="contributor">Contributor</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Approver" id="approver" />
                                    <Label htmlFor="approver">Approver</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Admin" id="admin" />
                                    <Label htmlFor="admin">Admin</Label>
                                </div>
                                </RadioGroup>
                                <p className="text-sm text-muted-foreground mt-2">
                                    - **Contributors** can create and edit drafts.
                                    - **Approvers** can review and approve content.
                                    - **Admins** have full access.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <div className="flex justify-between p-6 pt-0">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
                        Back
                    </Button>
                    {currentStep < STEPS.length ? (
                        <Button onClick={nextStep} disabled={isLoading || (currentStep === 1 && !organizationName.trim())}>
                           Next
                        </Button>
                    ) : (
                        <Button onClick={handleFinalSetup} disabled={isLoading || isExtracting}>
                            {(isLoading || isExtracting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Setup
                        </Button>
                    )}
                </div>
            </Card>
       </div>
    </div>
  );
}

function SourceInput({ source, onUpdate, onRemove }: { source: DocumentSource, onUpdate: (id: string, value: string | File, name?: string) => void, onRemove: (id: string) => void }) {
    const iconMap = {
        text: <Pilcrow className="h-4 w-4" />,
        file: <FileIcon className="h-4 w-4" />,
        url: <LinkIcon className="h-4 w-4" />,
    }
    return (
        <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
            <span className="text-muted-foreground">{iconMap[source.type]}</span>
            <div className="flex-1">
            {source.type === 'text' && (
                <Textarea 
                    placeholder="Paste your content here..." 
                    className="h-20"
                    onChange={(e) => onUpdate(source.id, e.target.value)}
                />
            )}
            {source.type === 'file' && (
                <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => {
                     const file = e.target.files?.[0];
                     if(file) onUpdate(source.id, file, file.name)
                }}/>
            )}
             {source.type === 'url' && (
                <Input placeholder="https://example.com/strategy" onChange={(e) => onUpdate(source.id, e.target.value, e.target.value)}/>
            )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(source.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
