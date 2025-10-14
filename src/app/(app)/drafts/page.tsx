'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function DraftsPage() {
  const { drafts } = useApp();

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Content Drafts</h1>
          <p className="text-muted-foreground">
            Create, manage, and track all your content in one place.
          </p>
        </div>
        <Link href="/drafts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Draft
          </Button>
        </Link>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Alignment</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.length > 0 ? (
                drafts.map(draft => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">{draft.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          draft.status === 'Approved'
                            ? 'default'
                            : draft.status === 'In Review'
                            ? 'secondary'
                            : draft.status === 'Rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                        className={cn(draft.status === 'Approved' && 'bg-green-600')}
                      >
                        {draft.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {draft.alignmentScore ? `${(draft.alignmentScore * 100).toFixed(0)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(draft.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/drafts/${draft.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No drafts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
