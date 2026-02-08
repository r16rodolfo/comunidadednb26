
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';
import authBg from '@/assets/auth-bg.jpg';

type AuthMode = 'login' | 'signup' | 'recovery';

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').max(128),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
});

const recoverySchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255),
});

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { login, register, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email: result.data.email, password: result.data.password });
      toast({ title: 'Login realizado com sucesso!' });

      if (user.role === UserRole.ADMIN || user.role === UserRole.GESTOR) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciais inválidas';
      if (message.includes('Invalid login credentials')) {
        setErrors({ form: 'E-mail ou senha incorretos.' });
      } else if (message.includes('Email not confirmed')) {
        setErrors({ form: 'Verifique seu e-mail antes de fazer login.' });
      } else {
        setErrors({ form: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = signupSchema.safeParse({ email, password, name });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register({ email: result.data.email, password: result.data.password, name: result.data.name });
      setSignupSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const result = recoverySchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(result.data.email);
      setRecoverySuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar e-mail';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: 'Erro ao conectar com Google',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    setRecoverySuccess(false);
    setSignupSuccess(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Full-page background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">DNB</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === 'login' && 'Bem-vindo de volta'}
              {mode === 'signup' && 'Criar sua conta'}
              {mode === 'recovery' && 'Recuperar senha'}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {mode === 'login' && 'Entre na sua conta para continuar'}
              {mode === 'signup' && 'Junte-se à comunidade DNB'}
              {mode === 'recovery' && 'Enviaremos um link para redefinir sua senha'}
            </p>
          </div>

          {/* Form error */}
          {errors.form && (
            <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-200">{errors.form}</p>
            </div>
          )}

          {/* Signup success */}
          {signupSuccess && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white">Verifique seu e-mail</h2>
              <p className="text-white/70 text-sm">
                Enviamos um link de confirmação para <strong className="text-white">{email}</strong>. 
                Clique no link para ativar sua conta.
              </p>
              <Button
                onClick={() => switchMode('login')}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Voltar para login
              </Button>
            </div>
          )}

          {/* Recovery success */}
          {recoverySuccess && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white">E-mail enviado!</h2>
              <p className="text-white/70 text-sm">
                Se houver uma conta com o e-mail <strong className="text-white">{email}</strong>, 
                você receberá um link para redefinir sua senha.
              </p>
              <Button
                onClick={() => switchMode('login')}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Voltar para login
              </Button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && !signupSuccess && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 text-sm">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('recovery')}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-white/50">ou continue com</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-11"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </Button>

              {/* Switch to signup */}
              <p className="text-center text-sm text-white/60 mt-6">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && !signupSuccess && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 text-sm">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                </div>
                {errors.name && <p className="text-xs text-red-300">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-white/90 text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-white/90 text-sm">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando conta...</>
                ) : (
                  'Criar conta'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-white/50">ou continue com</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-11"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </Button>

              {/* Switch to login */}
              <p className="text-center text-sm text-white/60 mt-6">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {/* Recovery Form */}
          {mode === 'recovery' && !recoverySuccess && (
            <form onSubmit={handleRecovery} className="space-y-4">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-white/90 text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    required
                  />
                </div>
                {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          © {new Date().getFullYear()} Comunidade DNB. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
