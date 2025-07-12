'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function SignupForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signup(email, password, name);
      toast({
        title: "Success!",
        description: "Your account has been created. Welcome!",
      });
      router.push('/profile');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="John Doe" 
              type="text" 
              disabled={isLoading} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              disabled={isLoading} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button disabled={isLoading} className='transition-transform hover:scale-105 active:scale-95'>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
