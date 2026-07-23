import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { InteractiveVideoCanvas } from './components/InteractiveVideoCanvas';
import { WatermarkControls } from './components/WatermarkControls';
import { ResultComparison } from './components/ResultComparison';
import { HelpSection } from './components/HelpSection';
import { VideoInfo, WatermarkBox, RemovalMode, ProcessResult } from './types';
import { AlertCircle, Film, Sparkles, RefreshCw, UploadCloud, ShieldCheck } from 'lucide-react';

export default function App() {
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [box, setBox] = useState<WatermarkBox>({
    xPct: 3.5,
    yPct: 2.5,
    wPct: 22,
    hPct: 4.5,
  });
  const [mode, setMode] = useState<RemovalMode>('delogo');
  const [patchColor, setPatchColor] = useState<string>('#18181b');
  const [blurRadius, setBlurRadius] = useState<number>(15);
  const [delogoBand, setDelogoBand] = useState<number>(1);

  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-load sample video on initial mount if no video selected
  useEffect(() => {
    loadSampleVideo();
  }, []);

  const loadSampleVideo = async () => {
    setIsLoadingSample(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/sample');
      if (!res.ok) {
        throw new Error('Gagal mengambil video contoh');
      }
      const data = await res.json();
      const sampleVideoInfo: VideoInfo = {
        id: data.id,
        name: data.name,
        url: data.url,
        width: data.width,
        height: data.height,
        duration: data.duration,
        isSample: true,
        folder: 'public',
      };
      setVideo(sampleVideoInfo);
      if (data.watermarkPreset) {
        setBox({
          xPct: data.watermarkPreset.xPct,
          yPct: data.watermarkPreset.yPct,
          wPct: data.watermarkPreset.wPct,
          hPct: data.watermarkPreset.hPct,
        });
      }
      setResult(null);
    } catch (err: any) {
      console.error('Failed to load sample:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleProcessVideo = async () => {
    if (!video) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const payload = {
        videoId: video.id,
        folder: video.folder || (video.isSample ? 'public' : 'uploads'),
        mode,
        box,
        patchColor,
        blurRadius,
        delogoBand,
      };

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Terjadi kesalahan saat memproses video');
      }

      const processData: ProcessResult = await res.json();
      setResult(processData);
    } catch (err: any) {
      console.error('Process error:', err);
      setErrorMsg(err.message || 'Gagal menghapus watermark dari video.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Navbar */}
      <Header
        onLoadSample={loadSampleVideo}
        onOpenHelp={() => setIsHelpOpen(true)}
        hasVideo={!!video}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl flex items-center justify-between gap-3 text-red-200 text-sm shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs bg-red-900/60 hover:bg-red-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* View State Switcher: Result Mode vs Editing Mode vs Upload Mode */}
        {result && video ? (
          <ResultComparison
            originalVideo={video}
            result={result}
            onReset={() => setResult(null)}
          />
        ) : (
          <div className="space-y-8">
            {/* Top Toolbar / Active Video Header */}
            {video && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 truncate max-w-md">
                      {video.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{video.width} x {video.height} px</span>
                      <span>•</span>
                      <span>{video.duration ? `${video.duration.toFixed(1)}s` : ''}</span>
                      {video.isSample && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                          Video Contoh
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setVideo(null);
                      setResult(null);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-cyan-400" />
                    <span>Ganti File Video</span>
                  </button>

                  <button
                    onClick={loadSampleVideo}
                    disabled={isLoadingSample}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Muat Ulang Contoh Video"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoadingSample ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {!video ? (
              <VideoUploader
                onVideoSelected={(info) => {
                  setVideo(info);
                  setResult(null);
                }}
                onLoadSample={loadSampleVideo}
                isLoading={isLoadingSample}
              />
            ) : (
              /* Two Column Editor Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Video Player with Draggable Bounding Box */}
                <div className="lg:col-span-7">
                  <InteractiveVideoCanvas
                    video={video}
                    box={box}
                    onChangeBox={setBox}
                    mode={mode}
                    patchColor={patchColor}
                  />
                </div>

                {/* Right: Removal Controls & Presets */}
                <div className="lg:col-span-5">
                  <WatermarkControls
                    box={box}
                    onChangeBox={setBox}
                    mode={mode}
                    onChangeMode={setMode}
                    patchColor={patchColor}
                    onChangePatchColor={setPatchColor}
                    blurRadius={blurRadius}
                    onChangeBlurRadius={setBlurRadius}
                    delogoBand={delogoBand}
                    onChangeDelogoBand={setDelogoBand}
                    onProcess={handleProcessVideo}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-900 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">Filter Delogo FFmpeg</h4>
              <p className="text-slate-400 leading-relaxed">
                Merekonstruksi piksel gambar dari area sekitar tanpa meninggalkan bekas buram kasar.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">Preset Watermark Popular</h4>
              <p className="text-slate-400 leading-relaxed">
                Klik satu tombol preset untuk langsung membidik watermark sudut kiri atas atau kanan bawah.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
            <Film className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">Pratinjau & Unduh MP4</h4>
              <p className="text-slate-400 leading-relaxed">
                Bandingkan hasil sebelum & sesudah secara langsung lalu unduh video MP4 berkualitas tinggi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Guide / Help Modal */}
      <HelpSection isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
