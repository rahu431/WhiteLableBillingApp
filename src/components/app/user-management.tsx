'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Button } from '../ui/button';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase/provider';

export default function UserManagement() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignIn = () => {
    initiateAnonymousSignIn(auth);
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
            <p>Welcome, {user.isAnonymous ? 'Anonymous User' : user.email}!</p>
            <p>User ID: {user.uid}</p>
          </div>
        ) : (
          <div>
            <p>No user is signed in.</p>
            <Button onClick={handleSignIn} className="mt-4">Sign In Anonymously</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
