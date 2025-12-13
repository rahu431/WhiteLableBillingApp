'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);
  
  const getUserInitials = () => {
    if (user?.isAnonymous) return "AN";
    if (user?.displayName) return user.displayName.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }

  const handleProfileUpdate = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Update your profile information. This will be visible to others.
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
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className='h-20 w-20'>
                  {photoURL && <AvatarImage src={photoURL} alt="User avatar" />}
                  <AvatarFallback className='text-2xl'>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{user.displayName || (user.isAnonymous ? 'Anonymous User' : 'User')}</p>
                  <p className="text-sm text-muted-foreground">{user.email || `UID: ${user.uid}`}</p>
                </div>
            </div>

            <div className="grid gap-4">
               <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Your Name"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="photoURL">Photo URL</Label>
                <Input 
                  id="photoURL" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)} 
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
            </div>
          </div>
        ) : (
          <p>No user is signed in. You should be redirected to the login page.</p>
        )}
      </CardContent>
      {user && (
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProfileUpdate} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
