import { ProfileForm } from '@/components/profile-form';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Profile</h1>
            <p className="text-muted-foreground">
                Keep your skills and information up-to-date to get the best swap matches.
            </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
