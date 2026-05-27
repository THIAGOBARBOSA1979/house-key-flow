import { PageTemplate } from "@/components/layout/PageTemplate";
import { Wrench } from "lucide-react";

const Maintenance = () => {
  return (
    <PageTemplate
      title="Manutenção Preventiva (ISO 9001)"
      description="Gestão de cronogramas e ciclos de inspeção técnica preventiva."
      icon={Wrench}
    >
      <div className="p-8 text-center border-2 border-dashed rounded-card">
        <p className="text-muted-foreground font-bold italic">Módulo de Manutenção Preventiva em construção...</p>
      </div>
    </PageTemplate>
  );
};
export default Maintenance;
