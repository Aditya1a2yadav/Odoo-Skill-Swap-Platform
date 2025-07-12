
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { AiSkillSuggester } from './ai-skill-suggester';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  location: z.string().optional(),
  skillsOffered: z.array(z.string()).min(1, 'Please list at least one skill to offer.'),
  skillsWanted: z.array(z.string()).min(1, 'Please list at least one skill you want.'),
  availability: z.array(z.string()).optional(),
  isProfilePublic: z.boolean().default(false),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const availabilityItems = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'evenings', label: 'Evenings' },
  { id: 'mornings', label: 'Mornings' },
];

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      location: '',
      skillsOffered: [],
      skillsWanted: [],
      availability: [],
      isProfilePublic: false,
      profilePhotoUrl: '',
    },
    mode: 'onChange',
  });

  const [offeredInput, setOfferedInput] = React.useState('');
  const [wantedInput, setWantedInput] = React.useState('');

  const fetchUserData = useCallback(async () => {
    if (user) {
      setIsFormLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const mappedData = {
            name: userData.name || user.displayName || '',
            location: userData.location || '',
            skillsOffered: userData.skillsOffered || [],
            skillsWanted: userData.skillsWanted || [], // Corrected field name
            availability: userData.availability || [],
            isProfilePublic: userData.isProfilePublic,
            profilePhotoUrl: userData.profilePhotoUrl || '',
          };
          form.reset(mappedData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your profile data.'
        });
      } finally {
        setIsFormLoading(false);
      }
    }
  }, [user, form, toast]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const addSkill = (type: 'skillsOffered' | 'skillsWanted') => {
    const input = type === 'skillsOffered' ? offeredInput : wantedInput;
    const setInput = type === 'skillsOffered' ? setOfferedInput : setWantedInput;
    
    if (input.trim()) {
        const currentSkills = form.getValues(type) || [];
        if (!currentSkills.includes(input.trim())) {
            const newSkills = [...currentSkills, input.trim()];
            form.setValue(type, newSkills, { shouldValidate: true, shouldDirty: true });
        }
        setInput('');
    }
  };

  const removeSkill = (skillToRemove: string, type: 'skillsOffered' | 'skillsWanted') => {
    const currentSkills = form.getValues(type) || [];
    const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
    form.setValue(type, newSkills, { shouldValidate: true, shouldDirty: true });
  };
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        
        const dataToSave = {
          name: data.name,
          location: data.location || '',
          skillsOffered: data.skillsOffered,
          skillsWanted: data.skillsWanted, // Corrected field name
          availability: data.availability || [],
          isProfilePublic: data.isProfilePublic,
          profilePhotoUrl: data.profilePhotoUrl || `https://icons.veryicon.com/png/o/miscellaneous/icon-icon-of-ai-intelligent-dispensing/login-user-name-1.png`,
          email: user.email 
        };

        await setDoc(userDocRef, dataToSave, { merge: true });
        
        form.reset(data);

        toast({
            title: 'Profile Updated!',
            description: 'Your changes have been saved successfully.',
        });
    } catch (error: any) {
        console.error('ERROR UPDATING PROFILE:', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: `An error occurred: ${error.message}. Please check the console for more details.`,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const { watch } = form;
  const skillsOffered = watch('skillsOffered');
  const skillsWanted = watch('skillsWanted');
  const previewUrl = watch('profilePhotoUrl');

  if (isFormLoading) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl || undefined} alt="Profile photo" />
                    <AvatarFallback>{form.getValues('name')?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">
                    This is your default profile picture.
                </div>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormDescription>Your location helps in finding local swaps.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <AiSkillSuggester onSelectSkill={(skill) => {
                    const currentSkills = form.getValues('skillsOffered') || [];
                    if (!currentSkills.includes(skill)) {
                       const newSkills = [...currentSkills, skill];
                       form.setValue('skillsOffered', newSkills, { shouldValidate: true, shouldDirty: true });
                    }
                }} />

                <FormField
                  control={form.control}
                  name="skillsOffered"
                  render={() => (
                    <FormItem>
                      <FormLabel>Skills you can offer</FormLabel>
                      <div className="flex gap-2">
                        <Input value={offeredInput} onChange={e => setOfferedInput(e.target.value)} placeholder="e.g., Graphic Design" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('skillsOffered'))}/>
                        <Button type="button" onClick={() => addSkill('skillsOffered')}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">
                          {skillsOffered?.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                  {skill}
                                  <button type="button" onClick={() => removeSkill(skill, 'skillsOffered')} className="ml-2 rounded-full hover:bg-black/10 p-0.5"><X className="h-3 w-3"/></button>
                              </Badge>
                          ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillsWanted"
                  render={() => (
                    <FormItem>
                      <FormLabel>Skills you want to learn</FormLabel>
                      <div className="flex gap-2">
                        <Input value={wantedInput} onChange={e => setWantedInput(e.target.value)} placeholder="e.g., Public Speaking" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('skillsWanted'))} />
                        <Button type="button" onClick={() => addSkill('skillsWanted')}>Add</Button>
                      </div>
                       <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">
                          {skillsWanted?.map(skill => (
                              <Badge key={skill} variant="outline" className="text-base py-1 pl-3 pr-1">
                                  {skill}
                                  <button type="button" onClick={() => removeSkill(skill, 'skillsWanted')} className="ml-2 rounded-full hover:bg-black/10 p-0.5"><X className="h-3 w-3"/></button>
                              </Badge>
                          ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormDescription>When are you generally available for swaps?</FormDescription>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                    {availabilityItems.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="availability"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(field.value?.filter((value) => value !== item.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isProfilePublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Profile</FormLabel>
                    <FormDescription>
                      Allow others to find your profile and send you swap requests.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className='transition-transform hover:scale-105 active:scale-95' disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
