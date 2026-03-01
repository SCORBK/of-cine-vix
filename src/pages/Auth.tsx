import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, User, Globe, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: `${name} ${surname}`.trim(),
            username: username || undefined,
            phone: phone || undefined,
            country: country || undefined,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "¡Cuenta creada!", description: "Bienvenido a Velora" });
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-primary">Vel</span><span className="text-foreground">ora</span>
          </h1>
          <p className="text-muted-foreground text-sm">Tu plataforma de entretenimiento</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex rounded-xl bg-secondary/50 p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === m ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                {mode === m && <motion.div layoutId="authTab" className="absolute inset-0 rounded-lg bg-primary shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">{m === "login" ? "Iniciar Sesión" : "Registrarse"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={mode} initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
              transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-4"
            >
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <AuthInput icon={User} placeholder="Nombre" value={name} onChange={setName} />
                    <AuthInput icon={User} placeholder="Apellido" value={surname} onChange={setSurname} />
                  </div>
                  <AuthInput icon={User} placeholder="Nombre de usuario" value={username} onChange={setUsername} />
                </>
              )}

              <AuthInput icon={Mail} placeholder="Correo electrónico" type="email" value={email} onChange={setEmail} />

              {mode === "register" && (
                <>
                  <AuthInput icon={Phone} placeholder="Número de teléfono" type="tel" value={phone} onChange={setPhone} />
                  <AuthInput icon={Globe} placeholder="País" value={country} onChange={setCountry} />
                </>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="w-4 h-4" /></div>
                <Input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border/50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === "login" ? "Entrar" : "Crear cuenta"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Legal links */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[11px] text-muted-foreground">
              Al continuar, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:underline">Términos y Condiciones</Link>
              {" "}y{" "}
              <Link to="/privacy" className="text-primary hover:underline">Políticas de Privacidad</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function AuthInput({ icon: Icon, placeholder, type = "text", value, onChange }: {
  icon: React.ElementType; placeholder: string; type?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Icon className="w-4 h-4" /></div>
      <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
    </div>
  );
}

export default Auth;
