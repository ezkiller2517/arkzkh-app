'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { extractStrategicBlueprint } from '@/ai/flows/extract-strategic-blueprint';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { StrategicBlueprint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function BlueprintPage() {
  const { blueprint, setBlueprint } = useApp();
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!documentContent.trim()) {
      toast({
        title: 'Error',
        description: 'Document content cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const extractedBlueprint = await extractStrategicBlueprint({ documentContent });
      setBlueprint(extractedBlueprint);
      toast({
        title: 'Success',
        description: 'Strategic blueprint extracted and updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract blueprint from the provided content.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Paste your strategic documents, mission statements, or any relevant text below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your content here..."
              className="min-h-[300px] text-sm"
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleExtract} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Extracting...' : 'Extract & Update Blueprint'}
            </Button>
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
            {blueprint ? (
              <BlueprintDisplay blueprint={blueprint} />
            ) : (
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
