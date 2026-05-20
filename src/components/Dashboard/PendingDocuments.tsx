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
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <FileText className="text-amber-500 h-5 w-5 md:h-6 md:w-6" />
          Protocolos Documentais
        </h2>
      </div>
      <Card className="card-standard border-none bg-amber-500/5 backdrop-blur-md overflow-hidden p-6 rounded-3xl border border-amber-500/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-amber-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-amber-800/80 leading-none mb-1">Manuais & Laudos</p>
                <p className="text-sm font-bold text-amber-900">12 aguardando revisão</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-amber-600 hover:bg-amber-100 rounded-xl">
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-red-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-red-800/80 leading-none mb-1">Termos Vencidos</p>
                <p className="text-sm font-bold text-red-900">5 laudos expirados</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-red-600 hover:bg-red-100 rounded-xl">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </section>

  );
};
