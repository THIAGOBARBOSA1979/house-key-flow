
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks";
import { CalendarDays, Clock, Video, Users } from "lucide-react";

export function ScheduleMeetingDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("video");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação enviada",
      description: "Nossa equipe analisará sua solicitação de reunião e confirmará o horário em breve.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-bold py-6">
          <CalendarDays className="mr-2 h-4 w-4 text-primary" />
          Agendar Reunião
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Agendar Reunião Técnica
            </DialogTitle>
            <DialogDescription>
              Solicite uma reunião com nossa equipe para tirar dúvidas específicas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tipo de Reunião</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2 font-medium">
                      <Video className="h-4 w-4" /> Chamada de Vídeo
                    </div>
                  </SelectItem>
                  <SelectItem value="presential">
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="h-4 w-4" /> Presencial (Escritório)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sugestão de Data</Label>
              <Input id="date" type="date" className="font-medium" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sugestão de Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="time" type="time" className="pl-10 font-medium" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assunto Principal</Label>
              <Input id="subject" placeholder="Ex: Dúvidas sobre o acabamento..." className="font-medium" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="font-bold uppercase tracking-widest text-xs">Solicitar Reunião</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
