'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/app-provider';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { drafts } = useApp();

  // Create events based on approved drafts from Firestore
  const events = drafts
    .filter(d => d.status === 'Approved' && d.updatedAt?.toDate)
    .map((d, i) => ({
        id: `evt-${i}`,
        title: d.title,
        date: new Date(new Date(d.updatedAt.toDate()).setDate(new Date(d.updatedAt.toDate()).getDate() + (i * 3 + 2))),
        type: (i % 2 === 0) ? 'External' : 'Internal',
        draftId: d.id,
    }));

  const selectedDateEvents = date ? events.filter(event => 
    event.date.toDateString() === date.toDateString()
  ) : [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Communications Calendar</h1>
        <p className="text-muted-foreground">
          Visualize your internal and external content schedule.
        </p>
      </header>
      
      <Tabs defaultValue="external" className="w-full">
        <TabsList>
          <TabsTrigger value="external">External</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
        </TabsList>
        <TabsContent value="external">
          <CalendarView type="External" date={date} setDate={setDate} events={events} selectedDateEvents={selectedDateEvents.filter(e => e.type === 'External')} />
        </TabsContent>
        <TabsContent value="internal">
          <CalendarView type="Internal" date={date} setDate={setDate} events={events} selectedDateEvents={selectedDateEvents.filter(e => e.type === 'Internal')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CalendarView({type, date, setDate, events, selectedDateEvents}: {type: 'Internal' | 'External', date: Date | undefined, setDate: (d: Date | undefined) => void, events: any[], selectedDateEvents: any[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 w-full",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-around",
                        row: "flex w-full mt-2 justify-around",
                    }}
                    components={{
                        Day: ({ date }) => {
                          const dayEvents = events.filter(
                            (event) =>
                              event.type === type &&
                              event.date.toDateString() === date.toDateString()
                          );
                          return (
                            <div className="relative flex items-center justify-center h-9 w-9">
                              <time dateTime={date.toISOString()}>{date.getDate()}</time>
                              {dayEvents.length > 0 && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                              )}
                            </div>
                          );
                        },
                      }}
                />
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>
                        {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDateEvents.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDateEvents.map(event => (
                                <div key={event.id} className="p-3 rounded-lg bg-muted/50">
                                    <h3 className="font-semibold">{event.title}</h3>
                                    <Badge variant="outline" className="mt-1">{event.type}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No events scheduled for this day.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
