import React, { useState } from 'react';
import { Download, CheckCircle, RefreshCw, Film, Sparkles, Clock, FileVideo, ExternalLink, Loader2 } from 'lucide-react';
import { ProcessResult, VideoInfo } from '../types';

interface ResultComparisonProps {
  originalVideo: VideoInfo;
  result: ProcessResult;
  onReset: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  originalVideo,
  result,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'after' | 'side-by-side' | 'before'>('after');
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadUrl = `/api/download/processed/${result.filename}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Gagal mengambil file');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(blobUrl);
        setIsDownloading(false);
      }, 1000);
    } catch (err) {
      console.error('Download via blob failed:', err);
      setIsDownloading(false);
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Watermark Berhasil Dihapus!
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Selesai
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Video telah diproses menggunakan filter FFmpeg {result.mode.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Top Download Button Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunduh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh MP4</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenNewTab}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Buka di Tab Baru / Download Langsung"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Buka di Tab Baru</span>
          </button>
        </div>
      </div>

      {/* Processing Metadata Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-slate-500 text-[10px]">Waktu Memproses</p>
            <p className="font-semibold">{result.processingTimeMs / 1000} Detik</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Film className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-slate-500 text-[10px]">Resolusi Frame</p>
            <p className="font-semibold">{result.width} x {result.height} px</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <FileVideo className="w-4 h-4 text-amber-400" />
          <div>
            <p className="text-slate-500 text-[10px]">Ukuran File Output</p>
            <p className="font-semibold">{formatFileSize(result.size)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-slate-500 text-[10px]">Metode Diterapkan</p>
            <p className="font-semibold capitalize">{result.mode}</p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center justify-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-fit mx-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('after')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'after'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hasil Bersih (Sesudah)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('side-by-side')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'side-by-side'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bandingkan (Side-by-Side)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('before')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'before'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Video Asli (Sebelum)
        </button>
      </div>

      {/* Video Players View */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-center min-h-[380px]">
        {activeTab === 'after' && (
          <div className="flex flex-col items-center">
            <span className="mb-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ✓ Clean Video (Tanpa Watermark)
            </span>
            <video
              src={result.processedUrl}
              controls
              autoPlay
              loop
              className="max-h-[480px] w-auto h-auto rounded-lg border border-slate-800 shadow-xl"
            />
          </div>
        )}

        {activeTab === 'before' && (
          <div className="flex flex-col items-center">
            <span className="mb-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Original Video (Dengan Watermark)
            </span>
            <video
              src={originalVideo.url}
              controls
              loop
              className="max-h-[480px] w-auto h-auto rounded-lg border border-slate-800 shadow-xl opacity-90"
            />
          </div>
        )}

        {activeTab === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Sebelum (Original Watermark)
              </span>
              <video
                src={originalVideo.url}
                controls
                loop
                className="max-h-[380px] w-auto h-auto rounded-lg border border-slate-800 shadow-lg"
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Sesudah (Clean Result)
              </span>
              <video
                src={result.processedUrl}
                controls
                loop
                className="max-h-[380px] w-auto h-auto rounded-lg border border-slate-800 shadow-lg ring-2 ring-emerald-500/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Atur Area Lain / Edit Video Lagi</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunduh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Video Hasil (.MP4)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Buka Video di Tab Baru"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Tab Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
