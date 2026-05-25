import { Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "@/hooks/identity/useAuthForm";

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  forgotPasswordLink: string;
  submitButtonText: string;
  emailPlaceholder?: string;
}

export const LoginForm = ({
  form,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  forgotPasswordLink,
  submitButtonText,
  emailPlaceholder = "seu@email.com"
}: LoginFormProps) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <Input 
                  placeholder={emailPlaceholder}
                  className="pl-12 h-14 bg-white/50 border-border/20 focus:bg-white transition-all shadow-none focus:shadow-sem-md" 

                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Senha</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="pl-12 pr-12 h-14 bg-white/50 border-border/20 focus:bg-white transition-all shadow-none focus:shadow-sem-md" 
                  placeholder="••••••••"

                  {...field} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="text-gray-700 font-medium">Lembrar de mim</span>
        </label>
        <Link to={forgotPasswordLink} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 text-sem-label uppercase tracking-widest font-black bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-sem-lg shadow-primary/20" 

        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Entrando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {submitButtonText}
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </Button>
    </form>
  </Form>
);
