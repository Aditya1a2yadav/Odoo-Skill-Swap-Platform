import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, CheckCircle2, Megaphone, Info } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
}

const iconMap = {
    swap_request: <ArrowRightLeft className="h-5 w-5 text-blue-500" />,
    swap_update: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    system_message: <Megaphone className="h-5 w-5 text-purple-500" />,
    default: <Info className="h-5 w-5 text-gray-500" />,
};

export function NotificationItem({ notification }: NotificationItemProps) {
    const icon = iconMap[notification.type] || iconMap.default;

    return (
        <div className={cn("flex items-start gap-4 p-4", !notification.read && "bg-primary/5")}>
            <div className="mt-1">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-foreground">{notification.payload.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
            </div>
            {!notification.read && (
                 <div className="w-2.5 h-2.5 rounded-full bg-accent mt-2"></div>
            )}
        </div>
    );
}
