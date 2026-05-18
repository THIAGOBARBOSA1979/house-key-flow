import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PendingDocuments: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 flex items-center gap-2">
          <FileText size={24} className="text-amber-500" />
          Pendências de Documentos
        </h2>
      </div>
      <Card className="card-standard border-none bg-amber-500/5 backdrop-blur-md overflow-hidden p-6 rounded-3xl border border-amber-500/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-amber-800/80 leading-none">Contratos</p>
                <p className="text-sm font-bold text-amber-900">8 aguardando assinatura</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-amber-600 hover:bg-amber-100">
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-red-800/80 leading-none">Vencidos</p>
                <p className="text-sm font-bold text-red-900">3 documentos expirados</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-red-600 hover:bg-red-100">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
