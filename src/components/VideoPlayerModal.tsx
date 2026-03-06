import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { DbMovie } from "@/types/movie";

interface Episode {
  id: string;
  movie_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  created_at: string;
}

interface VideoPlayerModalProps {
  movie: DbMovie;
  open: boolean;
  onClose: () => void;
}

const VideoPlayerModal = ({ movie, open, onClose }: VideoPlayerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const isSeries = (movie as any).content_type === "series";

  useEffect(() => {
    if (!open || !isSeries) return;
    const fetchEpisodes = async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("movie_id", movie.id)
        .order("season_number")
        .order("episode_number");
      if (data) {
        setEpisodes(data as Episode[]);
        if (data.length > 0) setSelectedEpisode(data[0] as Episode);
      }
    };
    fetchEpisodes();
  }, [open, movie.id, isSeries]);

  const currentVideoUrl = isSeries && selectedEpisode?.video_url
    ? selectedEpisode.video_url
    : movie.trailer_url;

  const seasons = [...new Set(episodes.map(e => e.season_number))].sort((a, b) => a - b);
  const seasonEpisodes = episodes.filter(e => e.season_number === selectedSeason);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setProgress(0);
    }
  }, [open]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setProgress(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else videoRef.current.requestFullscreen();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const playEpisode = (ep: Episode) => {
    setSelectedEpisode(ep);
    setPlaying(false);
    setProgress(0);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play();
        setPlaying(true);
      }
    }, 100);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
        onMouseMove={handleMouseMove}
      >
        {/* Top bar */}
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: showControls ? 0 : -60, opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent"
        >
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-bold text-sm md:text-base">
                {movie.title}
                {isSeries && selectedEpisode && (
                  <span className="text-white/60 font-normal ml-2">
                    T{selectedEpisode.season_number} · E{selectedEpisode.episode_number} - {selectedEpisode.title}
                  </span>
                )}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Video area */}
        <div className="flex-1 flex relative" onClick={togglePlay}>
          {currentVideoUrl ? (
            <video
              ref={videoRef}
              src={currentVideoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">Sin video disponible</p>
                <p className="text-white/30 text-sm mt-1">Agrega una URL de video desde el panel admin</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <motion.div
          animate={{ y: showControls ? 0 : 80, opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12"
        >
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-white/70 font-mono w-10 text-right">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 accent-primary rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-white/70 font-mono w-10">{formatTime(duration)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-3 rounded-full bg-primary hover:bg-primary/80 transition-colors">
                {playing ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary-foreground fill-current" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipForward className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors">
                {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Season/Episode selector panel for series */}
        {isSeries && seasons.length > 0 && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: showControls ? 0 : 320 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Season selector header */}
            <div className="p-4 border-b border-white/10">
              <h4 className="text-white font-bold text-sm mb-3">Temporadas y Episodios</h4>
              <div className="relative">
                <button
                  onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all"
                >
                  <span className="text-white font-semibold text-sm">
                    Temporada {selectedSeason}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${seasonDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {seasonDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-card border border-white/10 overflow-hidden shadow-2xl z-40"
                    >
                      {seasons.map(s => (
                        <button
                          key={s}
                          onClick={() => { setSelectedSeason(s); setSeasonDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            s === selectedSeason
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-white/80 hover:bg-white/10"
                          }`}
                        >
                          Temporada {s}
                          <span className="text-xs ml-2 opacity-60">
                            ({episodes.filter(e => e.season_number === s).length} eps)
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Episode list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {seasonEpisodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => playEpisode(ep)}
                  className={`w-full text-left p-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                    selectedEpisode?.id === ep.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {ep.thumbnail_url ? (
                      <img src={ep.thumbnail_url} alt={ep.title} className="w-24 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-24 h-14 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        selectedEpisode?.id === ep.id ? "text-primary" : "text-white/90"
                      }`}>
                        E{ep.episode_number} · {ep.title}
                      </p>
                      {ep.description && (
                        <p className="text-xs text-white/40 line-clamp-2">{ep.description}</p>
                      )}
                      {ep.duration && (
                        <p className="text-xs text-white/30 mt-1">{ep.duration}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {seasonEpisodes.length === 0 && (
                <p className="text-center text-white/30 text-sm py-8">Sin episodios en esta temporada</p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayerModal;
