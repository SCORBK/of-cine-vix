import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, MessageCircle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

type TicketStatus = "pending" | "in_progress" | "resolved";

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending: { label: "Pendiente", icon: AlertTriangle, bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  in_progress: { label: "En Proceso", icon: Clock, bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  resolved: { label: "Resuelto", icon: CheckCircle2, bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
};

const AdminReportsTab = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.reporter_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setReports(data.map((r: any) => ({ ...r, reporter: profileMap.get(r.reporter_id) })));
    } else {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    toast({ title: `Reporte marcado como ${status === "resolved" ? "resuelto" : status === "in_progress" ? "en proceso" : "pendiente"}` });
    fetchReports();
  };

  const counts = {
    pending: reports.filter(r => r.status === "pending").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["pending", "in_progress", "resolved"] as TicketStatus[]).map((s, i) => {
          const config = statusConfig[s];
          const Icon = config.icon;
          return (
            <motion.div key={s} custom={i} variants={fadeIn} initial="hidden" animate="visible"
              className={`rounded-xl border ${config.border} ${config.bg} p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${config.text}`} />
              <div>
                <p className={`text-xl font-bold ${config.text}`}>{counts[s]}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay reportes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => {
            const status = (report.status as TicketStatus) || "pending";
            const config = statusConfig[status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <motion.div key={report.id} custom={i} variants={fadeIn} initial="hidden" animate="visible"
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
              >
                <div className="px-5 py-4 flex items-start gap-4">
                  <img
                    src={report.reporter?.avatar_url || `https://ui-avatars.com/api/?name=U&background=random`}
                    alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{report.reporter?.display_name || "Usuario"}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text} border ${config.border}`}>
                        <StatusIcon className="w-3 h-3" /> {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.category}</p>
                    {report.message && <p className="text-sm text-foreground/80 mt-2">{report.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(report.created_at).toLocaleString("es-MX")}</p>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2 flex-wrap">
                  {status !== "pending" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(report.id, "pending")} className="text-xs gap-1 text-muted-foreground hover:text-accent">
                      <AlertTriangle className="w-3 h-3" /> Pendiente
                    </Button>
                  )}
                  {status !== "in_progress" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(report.id, "in_progress")} className="text-xs gap-1 text-muted-foreground hover:text-primary">
                      <Clock className="w-3 h-3" /> En Proceso
                    </Button>
                  )}
                  {status !== "resolved" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(report.id, "resolved")} className="text-xs gap-1 text-muted-foreground hover:text-accent">
                      <CheckCircle2 className="w-3 h-3" /> Resuelto
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReportsTab;
