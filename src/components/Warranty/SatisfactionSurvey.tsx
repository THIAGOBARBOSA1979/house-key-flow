
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { useToast } from "@/hooks";

interface SatisfactionSurveyProps {
  requestId: string;
  onComplete: () => void;
}

export const SatisfactionSurvey = ({ requestId, onComplete }: SatisfactionSurveyProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma nota antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be sent to a service
    console.log("Survey submitted:", { requestId, rating, comment });
    
    toast({
      title: "Obrigado!",
      description: "Sua avaliação foi enviada com sucesso e nos ajudará a melhorar nossos serviços.",
    });
    
    onComplete();
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-inner">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          Sua opinião é importante!
        </CardTitle>
        <CardDescription>
          Como você avalia o atendimento desta solicitação?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-125 transition-transform"
            >
              <Star 
                className={`h-8 w-8 ${
                  rating >= star ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
                }`} 
              />
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Algum comentário adicional? (Opcional)</p>
          <Textarea 
            placeholder="Conte-nos o que funcionou bem ou o que podemos melhorar..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none bg-background"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full font-bold gap-2">
          <Send className="h-4 w-4" />
          Enviar Avaliação
        </Button>
      </CardContent>
    </Card>
  );
};
