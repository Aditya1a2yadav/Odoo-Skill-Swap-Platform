'use client';

import { useEffect, useState } from 'react';
import { NotificationItem } from '@/components/notification-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Notification } from '@/lib/types';
import { CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedNotifications: Notification[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedNotifications.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate().toLocaleString(),
                } as Notification);
            });
            setNotifications(fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch notifications.',
            });
        });

        return () => unsubscribe();

    }, [user, toast]);

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        
        const batch = writeBatch(db);
        const unreadNotifications = notifications.filter(n => !n.read);
        
        if (unreadNotifications.length === 0) return;

        unreadNotifications.forEach(notification => {
            const notifRef = doc(db, 'notifications', notification.id);
            batch.update(notifRef, { read: true });
        });

        try {
            await batch.commit();
            toast({
                title: 'Success',
                description: 'All notifications marked as read.',
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not mark notifications as read. Please try again.',
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
                 <p className="text-muted-foreground">You need to be logged in to view your notifications.</p>
            </div>
        )
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Notifications</h1>
                        <p className="text-muted-foreground">Your recent activity on SkillSwap.</p>
                    </div>
                    <Button variant="outline" onClick={handleMarkAllAsRead} disabled={notifications.filter(n => !n.read).length === 0}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {notifications.length > 0 ? (
                            <div className="divide-y">
                                {notifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        ) : (
                             <p className="text-muted-foreground text-center p-8">You have no notifications.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
