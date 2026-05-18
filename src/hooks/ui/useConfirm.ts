import { useState, useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((newOptions: ConfirmOptions = {}) => {
    setOptions(newOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolver) resolver(true);
    setIsOpen(false);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) resolver(false);
    setIsOpen(false);
  }, [resolver]);

  return {
    confirm,
    isOpen,
    handleConfirm,
    handleCancel,
    options
  };
};
