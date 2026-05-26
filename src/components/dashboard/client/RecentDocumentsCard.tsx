import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Document {
  id: string;
  title: string;
  category: string;
  date: string;
  size: string;
}

const mockRecentDocs: Document[] = [
  { id: '1', title: 'Planta Humanizada Unidade 402', category: 'Projetos', date: 'Há 2 dias', size: '2.4 MB' },
  { id: '2', title: 'Manual do Proprietário - Bloco A', category: 'Manuais', date: 'Há 5 dias', size: '1.8 MB' },
  { id: '3', title: 'Memorial Descritivo de Acabamentos', category: 'Contratos', date: 'Há 1 semana', size: '0.9 MB' },
];

export const RecentDocumentsCard = () => {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-all group-hover:bg-primary/10" />
      
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText size={20} strokeWidth={3} />
            </div>
            Dossiê Recente
          </CardTitle>
          <Link to="/client/documents">
            <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/5 rounded-xl">
              Ver Todos <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0 space-y-4">
        {mockRecentDocs.map((doc, idx) => (
          <motion.div 
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-md transition-all group/item cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black truncate group-hover/item:text-primary transition-colors">{doc.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{doc.category}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> {doc.date}
                  </span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5">
              <Download size={16} />
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};