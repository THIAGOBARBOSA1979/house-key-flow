import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export const ReferralCard = () => (
  <Card className="bg-emerald-600 text-white shadow-xl rounded-[2rem] overflow-hidden relative group border-none">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <CardHeader className="pb-4">
       <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
         <Gift className="h-6 w-6 text-white" />
       </div>
       <CardTitle className="text-2xl font-black leading-tight">Indique um Amigo</CardTitle>
       <CardDescription className="text-emerald-100 font-medium">Ganhe descontos exclusivos na sua parcela por cada indicação.</CardDescription>
    </CardHeader>
    <CardContent>
      <Button className="w-full bg-white text-emerald-600 hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg">
        Conhecer Programa
      </Button>
    </CardContent>
  </Card>
);
