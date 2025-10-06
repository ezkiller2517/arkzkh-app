'use client';

import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/components/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { alignmentTrendData, objectiveCoverageData, chartConfig } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { drafts } = useApp();
  const bannerImage = PlaceHolderImages.find(img => img.id === 'dashboard-banner');
  const overallAlignment = drafts.filter(d => d.alignmentScore).reduce((acc, d) => acc + (d.alignmentScore || 0), 0) / drafts.filter(d => d.alignmentScore).length || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallAlignment * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average score across all content</p>
            <Progress value={overallAlignment * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'Approved').length}</div>
            <p className="text-xs text-muted-foreground">Total approved drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'In Review').length}</div>
            <p className="text-xs text-muted-foreground">Drafts awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.filter(d => d.status === 'Draft').length}</div>
            <p className="text-xs text-muted-foreground">Content currently in progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Alignment Trend</CardTitle>
            <CardDescription>Monthly average alignment score</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={alignmentTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Objective Coverage</CardTitle>
            <CardDescription>Content alignment with strategic objectives</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart layout="vertical" data={objectiveCoverageData} margin={{ right: 20, left: 20, top: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="objective" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="coverage" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>An overview of the latest content drafts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alignment</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.slice(0, 5).map(draft => (
                <TableRow key={draft.id}>
                  <TableCell className="font-medium">{draft.title}</TableCell>
                  <TableCell>{draft.author}</TableCell>
                  <TableCell>
                    <Badge variant={
                      draft.status === 'Approved' ? 'default' : 
                      draft.status === 'In Review' ? 'secondary' : 
                      draft.status === 'Rejected' ? 'destructive' : 'outline'
                    } className={cn(draft.status === 'Approved' && 'bg-green-600')}>{draft.status}</Badge>
                  </TableCell>
                  <TableCell>{draft.alignmentScore ? `${(draft.alignmentScore * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                  <TableCell>{new Date(draft.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
