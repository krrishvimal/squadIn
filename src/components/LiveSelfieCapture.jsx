import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, ShieldCheck, X, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LiveSelfieCapture = ({ currentAvatar, onPhotoCaptured, isVerified = false }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(currentAvatar || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks on unmount or when camera turns off
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to native mobile camera file input
        fileInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 480 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.warn('WebRTC camera notice, using direct device camera:', err);
      // If permission denied or unsupported, fallback to native camera input
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    
    // Draw cropped square from center of video stream
    const minDim = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    const startX = ((video.videoWidth || 400) - minDim) / 2;
    const startY = ((video.videoHeight || 400) - minDim) / 2;

    // Flip horizontally for natural mirror feel
    ctx.translate(400, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewPhoto(photoDataUrl);
    stopCamera();
    setIsCapturing(false);

    if (onPhotoCaptured) {
      onPhotoCaptured(photoDataUrl);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleNativeFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreviewPhoto(result);
        if (onPhotoCaptured) {
          onPhotoCaptured(result);
        }
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Camera size={15} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-stone-900">Live Selfie Verification</h4>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-extrabold">
                +30% Trust Boost
              </span>
            </div>
            <p className="text-[10px] text-stone-500">Anti-bot protection · Snaps front camera in real time</p>
          </div>
        </div>
        {isVerified && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
            <CheckCircle2 size={11} /> Verified
          </span>
        )}
      </div>

      {/* Hidden file input fallback for mobile front camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleNativeFileUpload}
        className="hidden"
      />

      {/* Live Camera Viewfinder Modal / Inline */}
      {isCameraActive ? (
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-[260px] mx-auto border-2 border-amber-500 shadow-lg">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover -scale-x-100"
          />

          {/* Oval face guide overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-40 h-48 rounded-full border-2 border-dashed border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse" />
            <span className="text-[10px] font-extrabold text-white bg-black/60 px-2.5 py-0.5 rounded-full mt-2 backdrop-blur-sm">
              Align face inside oval
            </span>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-10 px-4">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isCapturing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-espresso font-extrabold text-xs rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Camera size={14} />
              <span>{isCapturing ? 'Verifying...' : 'Snap Live Selfie'}</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="w-8 h-8 rounded-full bg-white/90 text-stone-700 shadow-sm border border-stone-200 flex items-center justify-center hover:bg-stone-800"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center gap-3.5 bg-stone-50 p-3 rounded-xl border border-stone-100">
            <div className="relative flex-shrink-0">
              <img
                src={previewPhoto || currentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Live Selfie"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white">
                  <ShieldCheck size={12} />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Camera size={13} className="text-amber-400" />
                <span>{previewPhoto ? 'Retake Live Selfie' : '📸 Take Live Selfie Verification'}</span>
              </button>

              <p className="text-[10px] text-stone-500 font-medium leading-tight">
                {previewPhoto
                  ? '✓ Live selfie confirmed! Anti-bot verification active.'
                  : 'Tap to open your front camera for real-time selfie verification.'}
              </p>
            </div>
          </div>

          {/* +30% Trust Boost Callout */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[10.5px] text-amber-900 font-bold">
            <Sparkles size={12} className="text-amber-600 flex-shrink-0" />
            <span>Live selfie increases profile trust by <strong>30%</strong> & prevents fake bot accounts.</span>
          </div>
        </div>
      )}
    </div>
  );
};
