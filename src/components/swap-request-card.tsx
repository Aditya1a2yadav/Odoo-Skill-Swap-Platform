'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SwapRequest } from '@/lib/types';
import { ArrowRight, Check, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwapRequestCardProps {
    swap: SwapRequest;
    perspective: 'requester' | 'target';
    onAction: (swapId: string, action: 'accepted' | 'rejected' | 'cancelled') => void;
}

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

export function SwapRequestCard({ swap, perspective, onAction }: SwapRequestCardProps) {
    const isPending = swap.status === 'pending';
    const isCompleted = swap.status === 'completed';
    const partner = perspective === 'requester' ? swap.target : swap.requester;

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={partner.profilePhotoUrl} alt={partner.name} />
                        <AvatarFallback>{partner.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{swap.createdAt}</p>
                    </div>
                </div>
                <Badge variant="outline" className={cn("capitalize", statusStyles[swap.status])}>{swap.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-around text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">You Offer</p>
                        <p className="font-semibold">{perspective === 'requester' ? swap.offeredSkill : swap.requestedSkill}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                    <div>
                        <p className="text-sm text-muted-foreground">You Get</p>
                        <p className="font-semibold">{perspective === 'requester' ? swap.requestedSkill : swap.offeredSkill}</p>
                    </div>
                </div>
                {swap.message && (
                     <div className="text-sm p-3 bg-slate-50 rounded-md border">
                        <p className="font-semibold mb-1">{partner.name} says:</p>
                        <p className="text-muted-foreground italic">&quot;{swap.message}&quot;</p>
                    </div>
                )}
            </CardContent>
            {isPending && (
                <CardFooter className="p-4 bg-slate-50/50 flex justify-end gap-2">
                    {perspective === 'target' && (
                        <>
                            <Button variant="outline" onClick={() => onAction(swap.id, 'rejected')}>
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button className='bg-green-600 hover:bg-green-700' onClick={() => onAction(swap.id, 'accepted')}>
                                <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                        </>
                    )}
                    {perspective === 'requester' && (
                        <Button variant="destructive" onClick={() => onAction(swap.id, 'cancelled')}>Cancel Request</Button>
                    )}
                </CardFooter>
            )}
            {isCompleted && (
                <CardFooter className="p-4 bg-slate-50/50 flex justify-end gap-2">
                    <Button variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700">
                        <Star className="mr-2 h-4 w-4" /> Leave Feedback
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
