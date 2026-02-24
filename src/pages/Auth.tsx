import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, Globe, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock — just navigate home
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-primary">Vel</span>
            <span className="text-foreground">ora</span>
          </h1>
          <p className="text-muted-foreground text-sm">Tu plataforma de entretenimiento</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-secondary/50 p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute inset-0 rounded-lg bg-primary shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m === "login" ? "Iniciar Sesión" : "Registrarse"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <AuthInput icon={User} placeholder="Nombre" />
                    <AuthInput icon={User} placeholder="Apellido" />
                  </div>
                  <AuthInput icon={User} placeholder="Nombre de usuario" />
                </>
              )}

              <AuthInput icon={Mail} placeholder="Correo electrónico" type="email" />

              {mode === "register" && (
                <>
                  <AuthInput icon={Phone} placeholder="Número de teléfono" type="tel" />
                  <AuthInput icon={Globe} placeholder="País" />
                </>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="pl-10 pr-10 bg-secondary/50 border-border/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "login" && (
                <div className="text-right">
                  <button type="button" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
                {mode === "login" ? "Entrar" : "Crear cuenta"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

function AuthInput({ icon: Icon, placeholder, type = "text" }: { icon: React.ElementType; placeholder: string; type?: string }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <Input type={type} placeholder={placeholder} className="pl-10 bg-secondary/50 border-border/50" />
    </div>
  );
}

export default Auth;
