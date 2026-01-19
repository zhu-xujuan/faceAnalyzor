"use client";

import { useEffect } from "react";
import { initCameraApp } from "./initCameraApp";

export function CameraApp() {
  useEffect(() => initCameraApp(), []);

  return (
    <div className="bg-gray-100 h-screen w-screen relative flex flex-col md:flex-row overflow-hidden">
      <div id="flash-overlay" className="fixed inset-0 bg-white pointer-events-none opacity-0 z-[9999]" />

      <div
        id="prompts-modal"
        className="fixed inset-0 bg-black/50 z-[10000] hidden flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col modal-enter overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📜</span> Prompt History
            </h2>
            <button id="close-modal-btn" className="text-gray-400 hover:text-gray-800 transition p-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div id="prompts-list" className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50" />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 flex-wrap justify-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-md flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Beauty</span>
          <input id="beauty-slider" type="range" min="0" max="10" defaultValue="5" className="w-24 accent-pink-500" />
          <span id="beauty-val" className="text-xs font-bold text-pink-500 w-4 text-center">
            5
          </span>
        </div>

        <button
          id="prompts-btn"
          className="bg-white border-2 border-blue-500 text-blue-500 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-lg cursor-pointer select-none hidden pointer-events-auto"
        >
          PROMPTS
        </button>

        <button
          id="delete-btn"
          className="bg-white border-2 border-red-500 text-red-500 px-5 py-2 rounded-full font-bold hover:bg-red-50 transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none hidden md:block pointer-events-auto"
        >
          DELETE
        </button>
        <button
          id="download-btn"
          className="bg-white border-2 border-black px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none pointer-events-auto"
        >
          DOWNLOAD
        </button>
      </div>

      <aside className="w-full md:w-80 md:h-full max-h-[40vh] md:max-h-none flex-none bg-white/70 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-200 p-4 overflow-y-auto sidebar-scroll">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">FaceAnalyzor</div>
            <div className="text-xs text-gray-500 truncate">Local assets</div>
          </div>
          <div className="text-xs text-gray-400 font-mono">Next.js</div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">Shutter Sound</div>
                <a className="text-xs text-blue-600 hover:underline break-all" href="/polaroid.mp3" target="_blank" rel="noopener">
                  polaroid.mp3
                </a>
              </div>
              <button
                id="test-shutter-btn"
                className="px-3 py-2 rounded-lg bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 transition select-none"
              >
                TEST
              </button>
            </div>
            <audio id="audio-preview" className="mt-3 w-full" controls preload="auto" src="/polaroid.mp3" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">Prompts Data</div>
                <a className="text-xs text-blue-600 hover:underline break-all" href="/prompts.json" target="_blank" rel="noopener">
                  prompts.json
                </a>
                <div id="prompts-status" className="mt-2 text-xs text-gray-500">
                  Not loaded
                </div>
              </div>
              <button
                id="prompts-sidebar-btn"
                className="px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition select-none hidden"
              >
                OPEN
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Tip: camera + prompts work on <span className="font-mono">http://localhost</span>.
            </p>
          </div>
        </div>
      </aside>

      <div className="w-full flex-1 min-h-0 md:flex-1 md:h-full flex items-center justify-center relative p-4" id="camera-zone">
        <div className="relative w-[320px] md:w-[450px] transition-all duration-500" id="camera-container">
          <div className="absolute top-0 left-1/2 -translate-x-[40px] w-[160px] h-[240px] z-0" id="printer-slot" />

          <img
            src="https://wgzhao.me/images/img/X5CczwV7I?w=800&fm=png"
            alt="Instant Camera"
            className="w-full relative z-20 pointer-events-none drop-shadow-2xl select-none"
            id="camera-img"
          />
          <div
            id="lens-wrapper"
            className="absolute z-30 overflow-hidden rounded-full bg-[#111] border-4 border-gray-800/50 shadow-inner"
            style={{ opacity: 0, transition: "opacity 0.3s" }}
          >
            <video id="webcam" autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          </div>
          <div
            id="shutter-btn"
            className="absolute z-40 rounded-full cursor-pointer hover:bg-white/10 active:bg-white/20 transition"
            title="Take Photo"
          />
          <div
            id="status-light"
            className="absolute top-[18%] right-[28%] w-3 h-3 rounded-full bg-red-500 z-30 shadow-[0_0_10px_red] transition-colors duration-300"
          />
        </div>
      </div>

      <div
        className="w-full flex-1 min-h-0 md:flex-1 md:h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative overflow-hidden"
        id="gallery-zone"
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 font-bold text-4xl uppercase tracking-widest select-none opacity-50">
          Drop Here
        </div>
      </div>

      <canvas id="render-canvas" className="hidden" />
    </div>
  );
}

