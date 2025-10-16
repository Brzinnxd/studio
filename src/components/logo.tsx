import { Candy } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary p-2 rounded-lg">
        <Candy className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold font-headline">Doçuras da Angel</span>
    </div>
  );
}
