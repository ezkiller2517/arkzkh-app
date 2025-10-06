'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc, setDoc, addDoc, collection, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UserRole, UserData } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function SetupPage() {
  const { auth, firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<UserRole>('Contributor');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
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
      const batch = writeBatch(firestore);

      // 1. Create Organization
      const orgRef = doc(collection(firestore, 'organizations'));
      batch.set(orgRef, { name: organizationName, id: orgRef.id });

      // 2. Update User Profile
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

      toast({ title: "Setup complete!", description: "Welcome to ARK-Z." });
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during setup:", error);
      toast({ title: "Setup failed", description: "Could not save initial information.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="mb-8">
            <Icons.Logo />
        </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome! Let's get you set up.</CardTitle>
          <CardDescription>
            Tell us a bit about your organization and your role.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              placeholder="e.g., Acme Inc."
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Your Role</Label>
            <RadioGroup
              defaultValue="Contributor"
              onValueChange={(value: UserRole) => setRole(value)}
              className="flex space-x-4"
               disabled={isLoading}
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
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
