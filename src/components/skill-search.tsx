'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { nlSearch } from '@/ai/flows/nl-search';
import { useToast } from '@/hooks/use-toast';


interface SkillSearchProps {
    onSearch: (skills: string[]) => void;
    isSearching: boolean;
}


export function SkillSearch({ onSearch, isSearching }: SkillSearchProps) {
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
        onSearch([]);
        return;
    }
    
    try {
        const result = await nlSearch({ query });
        onSearch(result.skills);
    } catch (error) {
        console.error("Error in NL search:", error);
        toast({
            variant: "destructive",
            title: "Search Error",
            description: "Could not understand the search query. Please try rephrasing."
        })
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Input
          type="search"
          placeholder="Search for skills like 'Python', 'Graphic Design'..."
          className="w-full pl-10 pr-28 h-12 text-base rounded-full shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className='mr-1' type="button">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter by availability</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>
                  Weekdays
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Weekends
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Evenings
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90 h-9" disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
        </div>
      </div>
    </form>
  );
}
