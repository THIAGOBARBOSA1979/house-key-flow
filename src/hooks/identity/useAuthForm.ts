import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";

export const loginFormSchema = z.object({
  email: z.string().email({
    message: "Digite um email válido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const useAuthForm = (activeTab: string) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      const roleKey = activeTab === "master" ? "rememberMaster" : (activeTab === "admin" ? "rememberAdmin" : "rememberClient");
      localStorage.setItem(roleKey, "true");
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberAdmin");
      localStorage.removeItem("rememberClient");
      localStorage.removeItem("rememberMaster");
    }

    const role = activeTab === 'master' ? 'admin' : (activeTab as 'admin' | 'client');
    await login(values.email, values.password, role);
  };

  return {
    form,
    isLoading,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    handleLogin
  };
};
