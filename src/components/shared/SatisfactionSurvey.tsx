import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SatisfactionSurveyProps {
  onDismiss: () => void;
  onSubmit: (data: { rating: number; comment: string }) => void;
  title?: string;
  description?: string;
}

export const SatisfactionSurvey = ({ 
  onDismiss, 
  onSubmit, 
  title = "Sua opinião é fundamental",
  description = "Como foi sua experiência com este atendimento técnico?"
}: SatisfactionSurveyProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, comment });
    setSubmitted(true);
    setTimeout(() => onDismiss(), 3000);
  };

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CardHeader className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <Star size={32} strokeWidth={2.5} fill={rating > 0 ? "currentColor" : "none"} />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">{title}</CardTitle>
              <CardDescription className="font-medium text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "p-2 transition-all duration-300 transform active:scale-90",
                      rating >= star ? "text-amber-500 scale-110" : "text-muted-foreground/30 hover:text-amber-500/50"
                    )}
                  >
                    <Star size={36} fill={rating >= star ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Comentários (Opcional)</label>
                <Textarea 
                  placeholder="Conte-nos mais sobre o que podemos melhorar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-2xl resize-none min-h-[100px] border-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleSubmit} 
                  disabled={rating === 0}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20"
                >
                  Enviar Feedback <Send size={14} className="ml-2" />
                </Button>
                <Button variant="ghost" onClick={onDismiss} className="w-full h-12 rounded-xl font-bold text-muted-foreground">
                  Pular agora
                </Button>
              </div>
            </CardContent>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center space-y-4"
          >
            <div className="mx-auto w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle size={40} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black tracking-tighter">Obrigado!</h3>
            <p className="text-muted-foreground font-medium">Sua avaliação foi registrada em nossos indicadores de qualidade ISO 9001.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};