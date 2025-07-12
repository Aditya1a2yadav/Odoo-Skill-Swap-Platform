import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SkillSwap home">
      <ArrowUpDown className="h-6 w-6 text-primary" />
      <span className="hidden text-xl font-bold font-headline sm:inline-block">
        SkillSwap
      </span>
    </Link>
  );
}
