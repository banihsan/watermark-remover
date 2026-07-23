import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Move, Maximize2, RotateCcw } from 'lucide-react';
import { WatermarkBox, VideoInfo, RemovalMode } from '../types';

interface InteractiveVideoCanvasProps {
  video: VideoInfo;
  box: WatermarkBox;
  onChangeBox: (newBox: WatermarkBox) => void;
  mode: RemovalMode;
  patchColor: string;
}

export const InteractiveVideoCanvas: React.FC<InteractiveVideoCanvasProps> = ({
  video,
  box,
  onChangeBox,
  mode,
  patchColor,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'se', 'sw', 'ne', 'nw'
  const [dragStart, setDragStart] = useState<{ x: number; y: number; box: WatermarkBox }>({
    x: 0,
    y: 0,
    box,
  });

  // Calculate actual pixels in original video resolution
  const pixelX = Math.round((box.xPct / 100) * (video.width || 1080));
  const pixelY = Math.round((box.yPct / 100) * (video.height || 1920));
  const pixelW = Math.round((box.wPct / 100) * (video.width || 1080));
  const pixelH = Math.round((box.hPct / 100) * (video.height || 1920));

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Drag to Move Box
  const handleMouseDownMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      box: { ...box },
    });
  };

  // Drag to Resize Box
  const handleMouseDownResize = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      box: { ...box },
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;

      if (isDragging) {
        const dxPct = ((e.clientX - dragStart.x) / containerW) * 100;
        const dyPct = ((e.clientY - dragStart.y) / containerH) * 100;

        let newX = dragStart.box.xPct + dxPct;
        let newY = dragStart.box.yPct + dyPct;

        // Clamp to boundaries
        newX = Math.max(0, Math.min(100 - dragStart.box.wPct, newX));
        newY = Math.max(0, Math.min(100 - dragStart.box.hPct, newY));

        onChangeBox({
          ...dragStart.box,
          xPct: parseFloat(newX.toFixed(2)),
          yPct: parseFloat(newY.toFixed(2)),
        });
      } else if (isResizing) {
        const dxPct = ((e.clientX - dragStart.x) / containerW) * 100;
        const dyPct = ((e.clientY - dragStart.y) / containerH) * 100;

        let { xPct, yPct, wPct, hPct } = dragStart.box;

        if (isResizing.includes('e')) {
          wPct = Math.max(3, Math.min(100 - xPct, dragStart.box.wPct + dxPct));
        }
        if (isResizing.includes('s')) {
          hPct = Math.max(3, Math.min(100 - yPct, dragStart.box.hPct + dyPct));
        }
        if (isResizing.includes('w')) {
          const maxDx = dragStart.box.wPct - 3;
          const clampedDx = Math.max(-dragStart.box.xPct, Math.min(maxDx, dxPct));
          xPct = dragStart.box.xPct + clampedDx;
          wPct = dragStart.box.wPct - clampedDx;
        }
        if (isResizing.includes('n')) {
          const maxDy = dragStart.box.hPct - 3;
          const clampedDy = Math.max(-dragStart.box.yPct, Math.min(maxDy, dyPct));
          yPct = dragStart.box.yPct + clampedDy;
          hPct = dragStart.box.hPct - clampedDy;
        }

        onChangeBox({
          xPct: parseFloat(xPct.toFixed(2)),
          yPct: parseFloat(yPct.toFixed(2)),
          wPct: parseFloat(wPct.toFixed(2)),
          hPct: parseFloat(hPct.toFixed(2)),
        });
      }
    },
    [isDragging, isResizing, dragStart, onChangeBox]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Video Canvas Header */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Atur Area Watermark (Tarik & Atur Ukuran Kotak Merah)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>
            {video.width}x{video.height}px
          </span>
          <span>•</span>
          <span className="text-cyan-400">
            X:{pixelX} Y:{pixelY} W:{pixelW} H:{pixelH}
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative bg-slate-950 flex items-center justify-center p-2 min-h-[360px] max-h-[560px] overflow-hidden select-none">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[500px] inline-block rounded-lg overflow-hidden border border-slate-800 shadow-xl"
        >
          <video
            ref={videoRef}
            src={video.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            muted={isMuted}
            loop
            playsInline
            className="max-h-[500px] w-auto h-auto object-contain block bg-black"
          />

          {/* Draggable Watermark Bounding Box Overlay */}
          <div
            onMouseDown={handleMouseDownMove}
            style={{
              left: `${box.xPct}%`,
              top: `${box.yPct}%`,
              width: `${box.wPct}%`,
              height: `${box.hPct}%`,
            }}
            className={`absolute border-2 cursor-move transition-colors z-20 group ${
              mode === 'delogo'
                ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : mode === 'blur'
                ? 'border-amber-400 bg-amber-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : mode === 'patch'
                ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'border-red-400 bg-red-500/20'
            }`}
          >
            {/* Mode-specific inner preview effect */}
            {mode === 'patch' && (
              <div
                className="w-full h-full opacity-80"
                style={{ backgroundColor: patchColor }}
              ></div>
            )}
            {mode === 'delogo' && (
              <div className="w-full h-full bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:6px_6px] opacity-40"></div>
            )}

            {/* Label badge */}
            <div className="absolute -top-6 left-0 bg-slate-900/90 text-[10px] font-bold px-1.5 py-0.5 rounded text-white border border-slate-700 whitespace-nowrap shadow flex items-center gap-1">
              <Move className="w-2.5 h-2.5 text-cyan-400" />
              <span>
                {mode === 'delogo'
                  ? 'Delogo'
                  : mode === 'blur'
                  ? 'Baur (Blur)'
                  : mode === 'patch'
                  ? 'Penutup Warna'
                  : 'Potong'}
              </span>
            </div>

            {/* Resize Handles (Corners) */}
            <div
              onMouseDown={(e) => handleMouseDownResize('nw', e)}
              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-full cursor-nwse-resize shadow hover:scale-125 transition-transform"
            ></div>
            <div
              onMouseDown={(e) => handleMouseDownResize('ne', e)}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-full cursor-nesw-resize shadow hover:scale-125 transition-transform"
            ></div>
            <div
              onMouseDown={(e) => handleMouseDownResize('sw', e)}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-full cursor-nesw-resize shadow hover:scale-125 transition-transform"
            ></div>
            <div
              onMouseDown={(e) => handleMouseDownResize('se', e)}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-full cursor-nwse-resize shadow hover:scale-125 transition-transform"
            ></div>
          </div>
        </div>
      </div>

      {/* Video Playback Toolbar */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Timeline Seek */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap min-w-[70px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
