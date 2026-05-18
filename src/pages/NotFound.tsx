import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-5xl font-black shadow-sem-sm">
            404
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-sem-h2 font-black tracking-tight text-foreground">Coordenada não localizada</h1>
          <p className="text-sem-body-base text-muted-foreground font-medium">
            O endereço que você tentou acessar não faz parte do nosso mapa digital ou foi realocado.
          </p>

        </div>
        <div className="pt-4">
          <a 
            href="/" 
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all active:scale-95"
          >
            Voltar para o Início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
