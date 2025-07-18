import { SignupForm } from '@/components/signup-form';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your SkillSwap account.
          </p>
        </div>
        <SignupForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
