'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signInWithGoogle } from '@/firebase/auth';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    await signInWithGoogle(auth);
  };
  
  if (isUserLoading || user) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-8">
        <div className="mb-8">
            <Icons.Logo />
        </div>
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard.</p>
          <Button onClick={handleSignIn} className="w-full">
            Sign In with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
