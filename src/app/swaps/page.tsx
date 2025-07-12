'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwapRequestCard } from '@/components/swap-request-card';
import type { SwapRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SwapsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [incoming, setIncoming] = useState<SwapRequest[]>([]);
    const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
    const [history, setHistory] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const swapsRef = collection(db, 'swaps');
        
        const q = query(swapsRef, 
            where('involvedUsers', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const allSwaps: SwapRequest[] = [];
            
            for (const swapDoc of querySnapshot.docs) {
                const data = swapDoc.data();
                const requesterId = data.requesterId;
                const targetId = data.targetId;

                const [requesterSnap, targetSnap] = await Promise.all([
                    getDoc(doc(db, "users", requesterId)),
                    getDoc(doc(db, "users", targetId))
                ]);

                const requesterData = requesterSnap.data();
                const targetData = targetSnap.data();

                allSwaps.push({
                    id: swapDoc.id,
                    requester: {
                        id: requesterId,
                        name: requesterData?.name || 'Unknown User',
                        profilePhotoUrl: requesterData?.profilePhotoUrl
                    },
                    target: {
                        id: targetId,
                        name: targetData?.name || 'Unknown User',
                        profilePhotoUrl: targetData?.profilePhotoUrl
                    },
                    offeredSkill: data.offeredSkill,
                    requestedSkill: data.requestedSkill,
                    status: data.status,
                    createdAt: data.createdAt.toDate().toLocaleDateString(),
                    message: data.message,
                } as SwapRequest);
            }
            
            setIncoming(allSwaps.filter(s => s.target.id === user.uid && s.status === 'pending'));
            setOutgoing(allSwaps.filter(s => s.requester.id === user.uid && s.status === 'pending'));
            setHistory(allSwaps.filter(s => s.status !== 'pending').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching swaps:", error);
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch your swaps.',
            });
        });

        return () => unsubscribe();
    }, [user, toast]);
    
    const handleSwapAction = async (swapId: string, newStatus: 'accepted' | 'rejected' | 'cancelled') => {
        try {
            const swapRef = doc(db, 'swaps', swapId);
            await updateDoc(swapRef, { status: newStatus });
            toast({
                title: 'Success',
                description: `Swap request has been ${newStatus}.`,
            });
        } catch (error) {
            console.error(`Error updating swap ${swapId}:`, error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update the swap status. Please try again.',
            });
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                 <h1 className="text-2xl font-bold">Please Log In</h1>
                 <p className="text-muted-foreground">You need to be logged in to view your swaps.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Your Swaps</h1>
                <p className="text-muted-foreground">
                    Manage your skill swap requests and view your swap history.
                </p>
            </div>
            <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="incoming">
                        Incoming
                        {incoming.length > 0 && <Badge variant="secondary" className="ml-2">{incoming.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">
                        Outgoing
                        {outgoing.length > 0 && <Badge variant="secondary" className="ml-2">{outgoing.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="incoming">
                    <div className="space-y-4 mt-4">
                        {incoming.length > 0 ? (
                            incoming.map(swap => <SwapRequestCard key={swap.id} swap={swap} perspective="target" onAction={handleSwapAction} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No incoming swap requests.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="outgoing">
                     <div className="space-y-4 mt-4">
                        {outgoing.length > 0 ? (
                            outgoing.map(swap => <SwapRequestCard key={swap.id} swap={swap} perspective="requester" onAction={handleSwapAction} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No outgoing swap requests.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="history">
                     <div className="space-y-4 mt-4">
                        {history.length > 0 ? (
                            history.map(swap => <SwapRequestCard key={swap.id} swap={swap} perspective={swap.requester.id === user.uid ? 'requester' : 'target'} onAction={handleSwapAction} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No swap history.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
