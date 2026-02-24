import { Flame } from "lucide-react";
import { motion } from "framer-motion";

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

interface ProfileStreakCardProps {
  streak: number;
}

const ProfileStreakCard = ({ streak }: ProfileStreakCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">{streak}</span>
            <span className="text-sm text-muted-foreground">días de racha</span>
          </div>
        </div>
        <div className="flex gap-1">
          {dayLabels.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-muted-foreground">{day}</span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < Math.min(streak, 7)
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-secondary/50 text-muted-foreground border border-border/30"
                }`}
              >
                {i < Math.min(streak, 7) ? "🔥" : "·"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileStreakCard;
