
'use client';

import { useState, useEffect } from "react";
import { UserCard } from "@/components/user-card";
import { SkillSearch } from "@/components/skill-search";
import type { UserProfile } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";

async function getFeaturedUsers(): Promise<UserProfile[]> {
  const usersCollectionRef = collection(db, "users");
  const q = query(usersCollectionRef, where("isProfilePublic", "==", true), limit(6));
  try {
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        location: data.location,
        profilePhotoUrl: data.profilePhotoUrl || `https://icons.veryicon.com/png/o/miscellaneous/icon-icon-of-ai-intelligent-dispensing/login-user-name-1.png`,
        skillsOffered: data.skillsOffered,
        skillsWanted: data.skillsWanted,
        availability: data.availability,
        rating: data.rating || { average: 0, count: 0 },
        isProfilePublic: data.isProfilePublic,
        age: data.age,
      } as UserProfile;
    });
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore: ", error);
    return [];
  }
}

export default function Home() {
  const [featuredUsers, setFeaturedUsers] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      setLoadingFeatured(true);
      const users = await getFeaturedUsers();
      setFeaturedUsers(users);
      setLoadingFeatured(false);
    }
    loadFeatured();
  }, []);

  const handleSearch = async (skills: string[]) => {
    if (skills.length === 0) {
        setSearchResults(null);
        return;
    }
    setIsSearching(true);
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, 
            where('isProfilePublic', '==', true)
        );
        const querySnapshot = await getDocs(q);

        const lowerCaseSkills = skills.map(skill => skill.toLowerCase());

        const results = querySnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as UserProfile;
            })
            .filter(user => {
                if (!user.skillsOffered || user.skillsOffered.length === 0) {
                    return false;
                }
                const lowerCaseOffered = user.skillsOffered.map(skill => skill.toLowerCase());
                return lowerCaseSkills.some(searchSkill => lowerCaseOffered.includes(searchSkill));
            });

        setSearchResults(results);
    } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  };

  const displayUsers = searchResults !== null ? searchResults : featuredUsers;
  const displayTitle = searchResults !== null ? "Search Results" : "Featured Profiles";

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16 animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-foreground">
          Find Your Perfect Skill Swap
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Search for skills you want to learn, and offer your own in return.
          Connect with talented individuals and grow together in a vibrant community.
        </p>
      </section>

      <SkillSearch onSearch={handleSearch} isSearching={isSearching} />

      <section className="mt-16">
        <h2 className="text-3xl font-bold font-headline mb-8 text-center">{displayTitle}</h2>
        {isSearching || loadingFeatured ? (
           <div className="flex justify-center items-center h-40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : displayUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayUsers.map((user, index) => (
              <div key={user.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <UserCard user={user} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            {searchResults !== null ? "No profiles found matching your search." : "Could not load any user profiles."}
          </p>
        )}
      </section>
    </div>
  );
}
