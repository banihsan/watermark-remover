import React, { useRef, useState } from 'react';
import { Upload, Video, Sparkles, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VideoInfo } from '../types';

interface VideoUploaderProps {
  onVideoSelected: (video: VideoInfo) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoSelected,
  onLoadSample,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processUpload(files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setUploadError(null);
    setUploadingProgress(10);

    // Validate size < 500MB
    if (file.size > 500 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 500MB.');
      setUploadingProgress(null);
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      setUploadingProgress(40);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadingProgress(80);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah file video');
      }

      const data = await res.json();
      setUploadingProgress(100);

      const videoInfo: VideoInfo = {
        id: data.id,
        name: data.name,
        url: data.url,
        size: data.size,
        width: data.width,
        height: data.height,
        duration: data.duration,
        thumbnailUrl: data.thumbnailUrl,
        folder: 'uploads',
      };

      setTimeout(() => {
        setUploadingProgress(null);
        onVideoSelected(videoInfo);
      }, 300);
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat mengunggah video');
      setUploadingProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
          Unggah Video yang Ingin Dihapus Watermark-nya
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Dukung format MP4, WebM, MOV, MKV, AVI. Pilih area watermark dengan kotak seleksi interaktif & hilangkan secara otomatis.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-950/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <p className="text-slate-200 font-semibold text-base mb-1">
              Tarik & Lepas File Video di Sini
            </p>
            <p className="text-slate-400 text-xs">
              atau <span className="text-cyan-400 underline decoration-cyan-500/40">klik untuk menjelajah file komputer</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-xs pt-2">
            <span className="flex items-center gap-1">
              <FileVideo className="w-3.5 h-3.5" /> MP4 / MOV / WebM
            </span>
            <span>•</span>
            <span>Maksimal 500 MB</span>
          </div>
        </div>

        {uploadingProgress !== null && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3"></div>
            <p className="text-cyan-300 font-medium text-sm mb-2">Mengunggah & Menganalisis Video...</p>
            <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${uploadingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Quick Sample Video Loader Option */}
      <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Ingin mencoba tanpa mengunggah file?</span>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Gunakan Video Contoh
        </button>
      </div>
    </div>
  );
};
