
'use client';

import { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { SwapRequestDialog } from './swap-request-dialog';
import { RateUserDialog } from './rate-user-dialog';

interface UserCardProps {
  user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);

  // Prevent a user from swapping with or rating themselves
  const isOwnProfile = currentUser?.uid === user.id;

  const skillsOffered = user.skillsOffered || [];
  const skillsWanted = user.skillsWanted || [];

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-transparent hover:border-primary/50">
        <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card/50">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl font-headline">{user.name}</CardTitle>
            {user.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </div>
            )}
          </div>
          <button 
            className="flex items-center gap-1 text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsRateDialogOpen(true)}
            disabled={!currentUser || isOwnProfile}
            aria-label={`Rate ${user.name}`}
          >
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold text-base">{user.rating.average.toFixed(1)}</span>
          </button>
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-primary">Offers:</h4>
            <div className="flex flex-wrap gap-2">
              {skillsOffered.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="transition-transform hover:scale-105">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2 text-primary">Wants:</h4>
            <div className="flex flex-wrap gap-2">
              {skillsWanted.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="transition-transform hover:scale-105">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-card/50">
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => setIsSwapDialogOpen(true)}
            disabled={!currentUser || isOwnProfile}
          >
            {isOwnProfile ? "This is you!" : (currentUser ? "Request Swap" : "Log in to swap")}
          </Button>
        </CardFooter>
      </Card>
      
      {currentUser && (
        <>
          <SwapRequestDialog 
            isOpen={isSwapDialogOpen}
            onOpenChange={setIsSwapDialogOpen}
            requester={currentUser}
            targetUser={user}
          />
          <RateUserDialog
            isOpen={isRateDialogOpen}
            onOpenChange={setIsRateDialogOpen}
            rater={currentUser}
            targetUser={user}
          />
        </>
      )}
    </>
  );
}
