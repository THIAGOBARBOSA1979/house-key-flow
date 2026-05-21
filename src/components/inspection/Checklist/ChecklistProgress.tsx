
import { Button } from "@/components/ui/button";

interface ChecklistProgressProps {
  progress: number;
  onReset: () => void;
}

export const ChecklistProgress = ({ progress, onReset }: ChecklistProgressProps) => {
  return (
    <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Progresso: {progress}%</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset} 
          className="h-7 text-xs text-destructive hover:bg-destructive/10"
        >
          Resetar
        </Button>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};
