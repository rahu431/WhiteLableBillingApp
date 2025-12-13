'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useAuth } from '@/firebase';
import { Button } from '../ui/button';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import Link from 'next/link';

export default function UserManagement() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users in your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading ? (
          <p>Loading user...</p>
        ) : user ? (
          <div>
            <p>Welcome, {user.isAnonymous ? 'Anonymous User' : user.email || 'User'}!</p>
            <p>User ID: {user.uid}</p>
          </div>
        ) : (
          <div className='flex flex-col items-start gap-4'>
            <p>No user is signed in.</p>
            <div className='flex gap-2'>
              <Button onClick={handleSignIn}>Sign In Anonymously</Button>
              <Button asChild variant="outline">
                <Link href="/login">Login with Email</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
