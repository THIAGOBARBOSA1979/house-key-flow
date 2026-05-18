import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface WarrantyErrorAlertProps {
  error: string;
  onRefresh: () => void;
}

export const WarrantyErrorAlert = ({ error, onRefresh }: WarrantyErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro ao carregar garantias</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        {error}
        <Button variant="outline" size="sm" onClick={onRefresh} className="ml-4">
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};
