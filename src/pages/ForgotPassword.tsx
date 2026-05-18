
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-indigo-600 items-center justify-center text-brand-foreground font-bold text-2xl shadow-xl mb-4">
            A2
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Recuperação de Acesso</h1>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-black">Problemas com sua senha?</CardTitle>
            <CardDescription className="text-sm font-medium">
              {submitted 
                ? "Se o endereço estiver em nossa base de dados, você receberá instruções de segurança em instantes."
                : "Informe seu e-mail corporativo para iniciarmos o protocolo de redefinição de segurança."}
            </CardDescription>

          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-11 h-12" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 font-bold bg-brand hover:bg-brand/90 transition-all">
                  Enviar Link de Recuperação
                </Button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-bold text-emerald-800">Email enviado para {email}</p>
                <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                  Tentar outro email
                </Button>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">
                <ArrowLeft size={16} />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
