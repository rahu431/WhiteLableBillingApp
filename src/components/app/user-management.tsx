'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export default function UserManagement() {
  const { user, isUserLoading } = useUser();
  
  const getUserInitials = () => {
    if (user?.isAnonymous) return "AN";
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    return "U";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          This is your user profile information. Full user management requires a backend implementation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-4">
            <Avatar className='h-16 w-16'>
              {user.photoURL && <AvatarImage src={user.photoURL} alt="User avatar" />}
              <AvatarFallback className='text-xl'>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.displayName || (user.isAnonymous ? 'Anonymous User' : 'User')}</p>
              <p className="text-sm text-muted-foreground">{user.email || `UID: ${user.uid}`}</p>
            </div>
          </div>
        ) : (
          <p>No user is signed in. You should be redirected to the login page.</p>
        )}
      </CardContent>
    </Card>
  );
}
