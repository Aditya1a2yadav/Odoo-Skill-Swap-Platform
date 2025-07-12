
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';

interface SwapRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  requester: FirebaseUser;
  targetUser: UserProfile;
}

export function SwapRequestDialog({ isOpen, onOpenChange, requester, targetUser }: SwapRequestDialogProps) {
  const [requesterProfile, setRequesterProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [requesterSkill, setRequesterSkill] = useState<string>('');
  const [manualSkill, setManualSkill] = useState('');
  const [targetSkill, setTargetSkill] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRequesterProfile() {
      if (!requester || !isOpen) return;
      setLoadingProfile(true);
      try {
        const userDocRef = doc(db, 'users', requester.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setRequesterProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching requester profile:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your skills.",
        });
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchRequesterProfile();
  }, [requester, isOpen, toast]);


  const handleSubmit = async () => {
    const offeredSkill = manualSkill.trim() || requesterSkill;

    if (!offeredSkill || !targetSkill) {
        toast({
            variant: 'destructive',
            title: 'Missing information',
            description: 'Please select or enter a skill to offer and a skill to request.',
        });
        return;
    }

    setIsSubmitting(true);
    try {
        // Create the swap request document
        await addDoc(collection(db, 'swaps'), {
            requesterId: requester.uid,
            targetId: targetUser.id,
            offeredSkill: offeredSkill,
            requestedSkill: targetSkill,
            message: message,
            status: 'pending',
            createdAt: serverTimestamp(),
            involvedUsers: [requester.uid, targetUser.id], // For easier querying
        });

        // Create a notification for the target user
        await addDoc(collection(db, 'notifications'), {
            userId: targetUser.id,
            type: 'swap_request',
            payload: {
                message: `${requester.displayName || 'A user'} sent you a swap request.`,
                link: '/swaps'
            },
            read: false,
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'Request Sent!',
            description: 'Your swap request has been sent successfully.',
        });
        onOpenChange(false); // Close dialog on success
        // Reset form
        setRequesterSkill('');
        setManualSkill('');
        setTargetSkill('');
        setMessage('');

    } catch (error) {
        console.error('Error creating swap request:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not send your request. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loadingProfile) {
        return (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-20 col-span-3" />
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="offer-skill" className="text-right pt-2">
              You Offer
            </Label>
            <div className='col-span-3 space-y-2'>
                <Select onValueChange={setRequesterSkill} value={requesterSkill} disabled={!!manualSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill from your profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {requesterProfile?.skillsOffered?.length ? (
                        requesterProfile.skillsOffered.map(skill => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-skills" disabled>Add skills to your profile first.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <Input 
                    placeholder='Manually enter a skill...'
                    value={manualSkill}
                    onChange={(e) => setManualSkill(e.target.value)}
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="request-skill" className="text-right">
              You Get
            </Label>
             <Select onValueChange={setTargetSkill} value={targetSkill}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a skill to learn" />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add an optional message..."
              className="col-span-3"
            />
          </div>
        </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Swap with {targetUser.name}</DialogTitle>
          <DialogDescription>
            Choose what you want to offer and what you want to learn.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || loadingProfile}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
