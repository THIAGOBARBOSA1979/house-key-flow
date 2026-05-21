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
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder={emailPlaceholder}
                  className="pl-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
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
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="pl-11 pr-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
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
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
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
