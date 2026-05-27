import { PageTemplate } from "@/components/layout/PageTemplate";
import { MessageSquare } from "lucide-react";

const Inbox = () => {
  return (
    <PageTemplate
      title="Inbox WhatsApp"
      description="Central de mensagens e comunicação técnica."
      icon={MessageSquare}
    >
      <div className="p-8 text-center border-2 border-dashed rounded-card">
        <p className="text-muted-foreground font-bold italic">Interface do WhatsApp Inbox em construção...</p>
      </div>
    </PageTemplate>
  );
};
export default Inbox;
