import React from 'react';
import { X, CheckCircle2, Wand2, Droplet, Square, Crop, Info } from 'lucide-react';

interface HelpSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Panduan Hapus Watermark Video</h3>
            <p className="text-xs text-slate-400">Tips mendapatkan hasil pembersihan video paling mulus</p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              1. Filter Delogo (Auto Interpolation)
            </div>
            <p>
              Teknologi FFmpeg <code>delogo</code> mengambil piksel dari batas luar kotak seleksi dan mengisi bagian dalam logo secara alami. Sangat cocok untuk watermark sudut seperti TikTok, CapCut, atau logo TV.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" />
              2. Filter Baur (Blur Halus)
            </div>
            <p>
              Sangat efektif untuk teks atau username bernoda padat di atas latar belakang bergerak seragam. Baurkan area watermark hingga teks tersamarkan tanpa merusak bagian lain.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Square className="w-4 h-4" />
              3. Penutup Warna (Solid Patch)
            </div>
            <p>
              Jika latar belakang video berwarna konstan (misal hitam/gelap), penutup warna padat menghasilkan hasil yang rapi dan cepat.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-red-400 flex items-center gap-1.5">
              <Crop className="w-4 h-4" />
              4. Crop Frame (Potong Pinggir)
            </div>
            <p>
              Memotong bagian pinggir frame secara bersih untuk video dengan watermark yang menempel tepat di tepi atas/bawah.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="font-bold text-slate-100 mb-2">Tips Penting:</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Buat kotak seleksi sedikit lebih besar (1-2px) dari area logo agar tidak ada sisa bayangan watermark.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Gunakan preset "Kiri Atas" jika watermark berada di sudut kiri atas.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Mengerti, Kembali ke Editor
          </button>
        </div>
      </div>
    </div>
  );
};
