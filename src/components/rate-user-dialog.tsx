
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface RateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  rater: FirebaseUser;
  targetUser: UserProfile;
}

export function RateUserDialog({ isOpen, onOpenChange, rater, targetUser }: RateUserDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'No rating selected',
        description: 'Please select a star rating before submitting.',
      });
      return;
    }
    
    setIsSubmitting(true);
    const userDocRef = doc(db, 'users', targetUser.id);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw "User document does not exist!";
        }

        const currentRating = userDoc.data().rating || { average: 0, count: 0 };
        const newCount = currentRating.count + 1;
        const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

        transaction.update(userDocRef, { 
            rating: {
                average: newAverage,
                count: newCount
            }
        });
      });
      
      toast({
        title: 'Rating Submitted!',
        description: `You've successfully rated ${targetUser.name}.`,
      });
      onOpenChange(false); // Close dialog on success
      setRating(0); // Reset for next time

    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not submit your rating. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate {targetUser.name}</DialogTitle>
          <DialogDescription>
            Let others know about your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center py-8">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "w-10 h-10 cursor-pointer transition-all",
                        (hoverRating >= star || rating >= star) 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-gray-300"
                    )}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                />
            ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleRatingSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
