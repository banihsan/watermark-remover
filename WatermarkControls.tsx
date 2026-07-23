import React from 'react';
import {
  Wand2,
  Droplet,
  Square,
  Crop,
  Sliders,
  Sparkles,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Layers,
  Palette,
} from 'lucide-react';
import { WatermarkBox, RemovalMode } from '../types';

interface WatermarkControlsProps {
  box: WatermarkBox;
  onChangeBox: (newBox: WatermarkBox) => void;
  mode: RemovalMode;
  onChangeMode: (mode: RemovalMode) => void;
  patchColor: string;
  onChangePatchColor: (color: string) => void;
  blurRadius: number;
  onChangeBlurRadius: (val: number) => void;
  delogoBand: number;
  onChangeDelogoBand: (val: number) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  box,
  onChangeBox,
  mode,
  onChangeMode,
  patchColor,
  onChangePatchColor,
  blurRadius,
  onChangeBlurRadius,
  delogoBand,
  onChangeDelogoBand,
  onProcess,
  isProcessing,
}) => {
  // Preset watermark locations
  const setPreset = (type: 'klipklip' | 'top-right' | 'bottom-right' | 'bottom-left' | 'center') => {
    if (type === 'klipklip') {
      onChangeBox({ xPct: 3.5, yPct: 2.5, wPct: 22, hPct: 4.5 });
    } else if (type === 'top-right') {
      onChangeBox({ xPct: 74, yPct: 3, wPct: 22, hPct: 5 });
    } else if (type === 'bottom-right') {
      onChangeBox({ xPct: 72, yPct: 91, wPct: 25, hPct: 6 });
    } else if (type === 'bottom-left') {
      onChangeBox({ xPct: 4, yPct: 90, wPct: 24, hPct: 6 });
    } else if (type === 'center') {
      onChangeBox({ xPct: 35, yPct: 40, wPct: 30, hPct: 20 });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Pengaturan Penghapusan</span>
          </h3>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            FFmpeg Delogo
          </span>
        </div>

        {/* Preset Watermark Locations */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2.5 block flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Posisi Preset Watermark Cepat:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset('klipklip')}
              className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900/80 hover:to-blue-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <ArrowUpLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kiri Atas</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('top-right')}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Kanan Atas</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('bottom-right')}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Kanan Bawah</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('bottom-left')}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Kiri Bawah</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('center')}
              className="col-span-1 sm:col-span-2 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Tengah Frame</span>
            </button>
          </div>
        </div>

        {/* Removal Method Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2.5 block">
            Metode Pembersihan:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeMode('delogo')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                mode === 'delogo'
                  ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Delogo (Auto-Fill)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Merekonstruksi piksel sekitar logo secara halus. Rekomendasi utama.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('blur')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                mode === 'blur'
                  ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                <Droplet className="w-3.5 h-3.5 text-amber-400" />
                <span>Baur (Blur Halus)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Menyamarkan watermark dengan filter keburaman Gaussian halus.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('patch')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                mode === 'patch'
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                <Square className="w-3.5 h-3.5 text-emerald-400" />
                <span>Penutup Warna</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Menutup logo dengan blok warna padat sesuai latarnya.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('crop')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                mode === 'crop'
                  ? 'bg-red-950/50 border-red-500 text-red-200 shadow-md shadow-red-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                <Crop className="w-3.5 h-3.5 text-red-400" />
                <span>Potong Frame</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Memotong bagian pinggir video tempat watermark berada.
              </p>
            </button>
          </div>
        </div>

        {/* Mode Specific Fine Tuning */}
        {mode === 'blur' && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Radius Keburaman (Blur):</span>
              <span className="font-mono text-amber-400 font-bold">{blurRadius}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={blurRadius}
              onChange={(e) => onChangeBlurRadius(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {mode === 'delogo' && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Ketebalan Band Interpolasi:</span>
              <span className="font-mono text-cyan-400 font-bold">{delogoBand}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={delogoBand}
              onChange={(e) => onChangeDelogoBand(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {mode === 'patch' && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Pilih Warna Penutup:
              </span>
              <span className="font-mono text-emerald-400">{patchColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {['#18181b', '#000000', '#27272a', '#3f3f46', '#ffffff'].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onChangePatchColor(col)}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                    patchColor === col ? 'border-emerald-400 scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: col }}
                  title={col}
                />
              ))}
              <input
                type="color"
                value={patchColor}
                onChange={(e) => onChangePatchColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
              />
            </div>
          </div>
        )}

        {/* Fine-grain coordinate sliders */}
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 block border-b border-slate-800/80 pb-1">
            Presisi Koordinat Kotak Seleksi (%):
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Posisi X:</span>
                <span className="font-mono text-slate-200">{box.xPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="0.5"
                value={box.xPct}
                onChange={(e) => onChangeBox({ ...box, xPct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Posisi Y:</span>
                <span className="font-mono text-slate-200">{box.yPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="0.5"
                value={box.yPct}
                onChange={(e) => onChangeBox({ ...box, yPct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Lebar (W):</span>
                <span className="font-mono text-slate-200">{box.wPct}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="80"
                step="0.5"
                value={box.wPct}
                onChange={(e) => onChangeBox({ ...box, wPct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Tinggi (H):</span>
                <span className="font-mono text-slate-200">{box.hPct}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="80"
                step="0.5"
                value={box.hPct}
                onChange={(e) => onChangeBox({ ...box, hPct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Execute Process CTA */}
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            <span>Memproses Video dengan FFmpeg...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hapus Watermark Sekarang</span>
          </>
        )}
      </button>
    </div>
  );
};
