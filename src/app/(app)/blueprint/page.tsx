'use client';

import { useState } from 'react';
import { File, Link, Loader2, Pilcrow } from 'lucide-react';
import { extractDocumentContent } from '@/ai/flows/extract-document-content';
import { extractStrategicBlueprint } from '@/ai/flows/extract-strategic-blueprint';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { StrategicBlueprint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function BlueprintPage() {
  const { blueprint, setBlueprint } = useApp();
  const [documentContent, setDocumentContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExtract = async (source: 'text' | 'url' | 'file') => {
    let contentToProcess = '';
    setIsLoading(true);

    try {
      if (source === 'text') {
        if (!documentContent.trim()) {
          toast({
            title: 'Error',
            description: 'Document content cannot be empty.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        contentToProcess = documentContent;
      } else if (source === 'url') {
        if (!url.trim()) {
          toast({ title: 'Error', description: 'URL cannot be empty.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const result = await extractDocumentContent({ document: { url } });
        contentToProcess = result.content;
      } else if (source === 'file') {
        if (!file) {
          toast({ title: 'Error', description: 'Please select a file.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const dataUri = reader.result as string;
          try {
            const result = await extractDocumentContent({ document: { data: dataUri } });
            contentToProcess = result.content;
            await processBlueprint(contentToProcess);
          } catch(e) {
            handleError(e);
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = (error) => {
            handleError(error);
            setIsLoading(false);
        }
        // processBlueprint is called within the onload handler for file processing
        return;
      }

      await processBlueprint(contentToProcess);

    } catch (error) {
      handleError(error);
    } finally {
        if (source !== 'file') {
            setIsLoading(false);
        }
    }
  };

  const processBlueprint = async (content: string) => {
    if (!content.trim()) {
        toast({
            title: 'Extraction Failed',
            description: 'Could not extract any content from the source.',
            variant: 'destructive',
        });
        return;
    }
    const extractedBlueprint = await extractStrategicBlueprint({ documentContent: content });
    setBlueprint(extractedBlueprint);
    toast({
      title: 'Success',
      description: 'Strategic blueprint extracted and updated.',
    });
  }

  const handleError = (error: any) => {
    console.error(error);
    toast({
      title: 'Extraction Failed',
      description: 'Could not extract blueprint from the provided source.',
      variant: 'destructive',
    });
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Strategic Blueprint</h1>
        <p className="text-muted-foreground">
          Extract or define your organization's core strategy to power AI alignment scoring.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Source Document</CardTitle>
            <CardDescription>
              Provide a source document by pasting text, uploading a file (PDF), or entering a URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text"><Pilcrow className="mr-2 h-4 w-4"/>Text</TabsTrigger>
                <TabsTrigger value="file"><File className="mr-2 h-4 w-4"/>File</TabsTrigger>
                <TabsTrigger value="url"><Link className="mr-2 h-4 w-4"/>URL</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="pt-4 space-y-4">
                <Textarea
                  placeholder="Paste your content here..."
                  className="min-h-[300px] text-sm"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={() => handleExtract('text')} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Extract from Text
                </Button>
              </TabsContent>
              <TabsContent value="file" className="pt-4 space-y-4">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  disabled={isLoading}
                  accept=".pdf"
                />
                <Button onClick={() => handleExtract('file')} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Extract from File
                </Button>
              </TabsContent>
              <TabsContent value="url" className="pt-4 space-y-4">
                <Input
                  placeholder="https://example.com/strategy-doc"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={() => handleExtract('url')} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Extract from URL
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Blueprint</CardTitle>
            <CardDescription>
              This blueprint is used to score all content for strategic alignment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
                 <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <span>Analyzing Document...</span>
                    </div>
                </div>
            )}
            {!isLoading && blueprint ? (
              <BlueprintDisplay blueprint={blueprint} />
            ) : !isLoading && (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No blueprint extracted yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BlueprintDisplay({ blueprint }: { blueprint: StrategicBlueprint }) {
    return (
        <div className="space-y-6">
            <BlueprintSection title="Vision" content={blueprint.vision} />
            <BlueprintSection title="Mission" content={blueprint.mission} />
            <BlueprintSection title="Values" content={blueprint.values} />
            <BlueprintSection title="Objectives" content={blueprint.objectives} />
            <BlueprintSection title="Pillars" content={blueprint.pillars} />
            <BlueprintSection title="Taxonomy Terms" content={blueprint.taxonomyTerms} />
        </div>
    );
}

function BlueprintSection({ title, content }: { title: string; content: string | string[] }) {
    if (!content || (Array.isArray(content) && content.length === 0)) {
        return null;
    }
    
    return (
        <div>
            <h3 className="text-lg font-semibold font-headline mb-2">{title}</h3>
            {Array.isArray(content) ? (
                <div className="flex flex-wrap gap-2">
                    {content.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">{content}</p>
            )}
        </div>
    );
}
