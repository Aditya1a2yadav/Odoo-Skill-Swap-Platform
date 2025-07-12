'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function UserNav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
        </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center gap-2">
         <Link href="/login">
            <Button variant="ghost">Login</Button>
         </Link>
         <Link href="/signup">
            <Button>Sign Up</Button>
         </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
       <Link href="/notifications">
        <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
        </Button>
       </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || 'https://icons.veryicon.com/png/o/miscellaneous/icon-icon-of-ai-intelligent-dispensing/login-user-name-1.png'} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/profile">
                <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
