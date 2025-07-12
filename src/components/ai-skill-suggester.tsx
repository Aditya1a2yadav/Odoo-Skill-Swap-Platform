'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
import { suggestSkills, SkillSuggestionInput } from '@/ai/flows/skill-suggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"

interface AiSkillSuggesterProps {
    onSelectSkill: (skill: string) => void;
}

export function AiSkillSuggester({ onSelectSkill }: AiSkillSuggesterProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const getSuggestions = async () => {
        setLoading(true);
        try {
            const input: SkillSuggestionInput = {
                // In a real app, this data would come from the user's actual profile
                profileContent: 'User is a frontend developer interested in UI/UX.',
                swapHistory: 'Swapped React development for logo design.',
                trendingSkills: 'AI, Machine Learning, Data Science, Figma',
            };
            const result = await suggestSkills(input);
            setSuggestions(result.suggestedSkills);
        } catch (error) {
            console.error('Error fetching skill suggestions:', error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Could not fetch skill suggestions. Please try again.",
            })
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (skill: string) => {
        onSelectSkill(skill);
        setSuggestions(suggestions.filter(s => s !== skill));
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-base">AI Skill Suggestions</h4>
                    <p className="text-sm text-muted-foreground">Not sure what to offer? Let us help!</p>
                </div>
                <Button onClick={getSuggestions} disabled={loading} type="button">
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Suggest Skills
                </Button>
            </div>
            {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map((skill, index) => (
                        <button key={index} onClick={() => handleSuggestionClick(skill)} className="cursor-pointer">
                            <Badge variant="outline" className="text-base bg-accent/20 border-accent text-accent-foreground hover:bg-accent/40 transition-colors">
                               + {skill}
                            </Badge>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
