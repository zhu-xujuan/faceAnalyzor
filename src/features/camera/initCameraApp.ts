import { emotionAnalyzer } from '@/lib/emotionAnalyzer';
import { speak } from '@/lib/speechUtils';
import { EMOTIONS } from '@/types/emotion';
import {
  showNoFaceDetectedMessage,
  showAnalyzingLoader,
  showInteractiveEmotionResult,
} from '@/lib/emotionUI';
import { recordVisitor } from '@/lib/visitorStats';

type Cleanup = () => void;

export function initCameraApp(): Cleanup {
  const cleanups: Cleanup[] = [];
  const on = <K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    handler: (ev: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, handler as EventListener, options);
    cleanups.push(() => target.removeEventListener(type, handler as EventListener, options));
  };

  const onWindow = <K extends keyof WindowEventMap>(
    type: K,
    handler: (ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => {
    window.addEventListener(type, handler as EventListener, options);
    cleanups.push(() => window.removeEventListener(type, handler as EventListener, options));
  };

  const onEl = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    handler: (ev: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => {
    el.addEventListener(type, handler as EventListener, options);
    cleanups.push(() => el.removeEventListener(type, handler as EventListener, options));
  };

  const CAMERA_CONFIG = { lensTop: 50.5, lensLeft: 52.5, lensSize: 20.5, btnTop: 36, btnLeft: 15, btnSize: 10 };

  let selectedPhotoId: string | null = null;
  let dragItem: HTMLElement | null = null;
  let dragOffset = { x: 0, y: 0 };
  let startPos = { x: 0, y: 0 };
  let isDragging = false;
  let zIndexCounter = 100;

  const shutterAudio = new Audio("/polaroid.mp3");
  shutterAudio.preload = "auto";

  const video = document.getElementById("webcam") as HTMLVideoElement | null;
  const lensWrapper = document.getElementById("lens-wrapper") as HTMLDivElement | null;
  const shutterBtn = document.getElementById("shutter-btn") as HTMLDivElement | null;
  const flashOverlay = document.getElementById("flash-overlay") as HTMLDivElement | null;
  const printerSlot = document.getElementById("printer-slot") as HTMLDivElement | null;
  const galleryZone = document.getElementById("gallery-zone") as HTMLDivElement | null;
  const statusLight = document.getElementById("status-light") as HTMLDivElement | null;
  const downloadBtn = document.getElementById("download-btn") as HTMLButtonElement | null;
  const deleteBtn = document.getElementById("delete-btn") as HTMLButtonElement | null;
  const beautySlider = document.getElementById("beauty-slider") as HTMLInputElement | null;
  const beautyVal = document.getElementById("beauty-val") as HTMLSpanElement | null;
  const promptsBtn = document.getElementById("prompts-btn") as HTMLButtonElement | null;
  const promptsModal = document.getElementById("prompts-modal") as HTMLDivElement | null;
  const promptsList = document.getElementById("prompts-list") as HTMLDivElement | null;
  const closeModalBtn = document.getElementById("close-modal-btn") as HTMLButtonElement | null;
  const testShutterBtn = document.getElementById("test-shutter-btn") as HTMLButtonElement | null;
  const faceZoomBtn = document.getElementById("face-zoom-btn") as HTMLButtonElement | null;
  const statsPhotos = document.getElementById("stats-photos") as HTMLDivElement | null;
  const statsResponses = document.getElementById("stats-responses") as HTMLDivElement | null;
  const statsHappy = document.getElementById("stats-happy") as HTMLSpanElement | null;
  const statsSatisfied = document.getElementById("stats-satisfied") as HTMLSpanElement | null;
  const statsConfused = document.getElementById("stats-confused") as HTMLSpanElement | null;
  const statsNotGreat = document.getElementById("stats-not-great") as HTMLSpanElement | null;
  const statsResetBtn = document.getElementById("stats-reset-btn") as HTMLButtonElement | null;
  const promptsSidebarBtn = document.getElementById("prompts-sidebar-btn") as HTMLButtonElement | null;
  const promptsStatus = document.getElementById("prompts-status") as HTMLDivElement | null;

  if (
    !video ||
    !lensWrapper ||
    !shutterBtn ||
    !flashOverlay ||
    !printerSlot ||
    !galleryZone ||
    !statusLight ||
    !downloadBtn ||
    !deleteBtn ||
    !beautySlider ||
    !beautyVal ||
    !promptsBtn ||
    !promptsModal ||
    !promptsList ||
    !closeModalBtn ||
    !faceZoomBtn
  ) {
    return () => {};
  }

  const videoEl = video;
  const lensWrapperEl = lensWrapper;
  const shutterBtnEl = shutterBtn;
  const flashOverlayEl = flashOverlay;
  const printerSlotEl = printerSlot;
  const galleryZoneEl = galleryZone;
  const statusLightEl = statusLight;
  const downloadBtnEl = downloadBtn;
  const deleteBtnEl = deleteBtn;
  const beautySliderEl = beautySlider;
  const beautyValEl = beautyVal;
  const promptsBtnEl = promptsBtn;
  const promptsModalEl = promptsModal;
  const promptsListEl = promptsList;
  const closeModalBtnEl = closeModalBtn;
  const faceZoomBtnEl = faceZoomBtn;

  let stream: MediaStream | null = null;

  type PromptItem = { text: string; imgs?: string[] };

  type Box = { x: number; y: number; w: number; h: number };

  let faceZoomEnabled = false;
  let latestFace: Box | null = null;
  let smoothedFace: Box | null = null;

  const canUseFaceDetector = typeof window !== "undefined" && "FaceDetector" in window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FaceDetectorCtor = canUseFaceDetector ? (window as any).FaceDetector : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceDetector: any = FaceDetectorCtor ? new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 }) : null;
  let detectTimer: number | null = null;
  let detectBusy = false;

  const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME;

  type Mood = "happy" | "satisfied" | "confused" | "not_great";
  type StatsV1 = {
    photos: number;
    responses: number;
    mood: Record<Mood, number>;
    categories: Record<string, number>;
    updatedAt: number;
  };

  const STATS_KEY = "faceanalyzor_stats_v1";

  function emptyStats(): StatsV1 {
    return {
      photos: 0,
      responses: 0,
      mood: { happy: 0, satisfied: 0, confused: 0, not_great: 0 },
      categories: {},
      updatedAt: Date.now()
    };
  }

  function loadStats(): StatsV1 {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (!raw) return emptyStats();
      const data = JSON.parse(raw) as Partial<StatsV1>;
      const base = emptyStats();
      return {
        photos: Number.isFinite(data.photos) ? Number(data.photos) : base.photos,
        responses: Number.isFinite(data.responses) ? Number(data.responses) : base.responses,
        mood: {
          happy: Number.isFinite(data.mood?.happy) ? Number(data.mood?.happy) : 0,
          satisfied: Number.isFinite(data.mood?.satisfied) ? Number(data.mood?.satisfied) : 0,
          confused: Number.isFinite(data.mood?.confused) ? Number(data.mood?.confused) : 0,
          not_great: Number.isFinite(data.mood?.not_great) ? Number(data.mood?.not_great) : 0
        },
        categories: typeof data.categories === "object" && data.categories ? (data.categories as Record<string, number>) : {},
        updatedAt: Number.isFinite(data.updatedAt) ? Number(data.updatedAt) : base.updatedAt
      };
    } catch {
      return emptyStats();
    }
  }

  function saveStats(s: StatsV1) {
    s.updatedAt = Date.now();
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  }

  function renderStats(s: StatsV1) {
    if (statsPhotos) statsPhotos.textContent = String(s.photos);
    if (statsResponses) statsResponses.textContent = String(s.responses);
    if (statsHappy) statsHappy.textContent = String(s.mood.happy);
    if (statsSatisfied) statsSatisfied.textContent = String(s.mood.satisfied);
    if (statsConfused) statsConfused.textContent = String(s.mood.confused);
    if (statsNotGreat) statsNotGreat.textContent = String(s.mood.not_great);
  }

  let stats = emptyStats();
  function initStats() {
    stats = loadStats();
    renderStats(stats);
    if (statsResetBtn) {
      onEl(statsResetBtn, "click", () => {
        stats = emptyStats();
        saveStats(stats);
        renderStats(stats);
      });
    }
  }

  function bumpPhotos() {
    stats.photos += 1;
    saveStats(stats);
    renderStats(stats);
  }

  function bumpMood(mood: Mood) {
    stats.responses += 1;
    stats.mood[mood] += 1;
    saveStats(stats);
    renderStats(stats);
  }

  function bumpCategory(category: string) {
    const key = category.trim().slice(0, 40);
    if (!key) return;
    stats.categories[key] = (stats.categories[key] ?? 0) + 1;
    saveStats(stats);
  }

  function ensureOverlayRoot() {
    let root = document.getElementById("analysis-overlay-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "analysis-overlay-root";
      root.className = "fixed inset-0 pointer-events-none z-[11000]";
      document.body.appendChild(root);
    }
    return root;
  }


  function showInsightSticker(input: { title: string; message: string }) {
    const root = ensureOverlayRoot();
    const sticker = document.createElement("div");
    const tilt = (Math.random() * 10 - 5).toFixed(2);
    const left = Math.round(18 + Math.random() * 220);
    const bottom = Math.round(90 + Math.random() * 140);
    const r1 = 40 + Math.round(Math.random() * 30);
    const r2 = 30 + Math.round(Math.random() * 40);

    sticker.className = "pointer-events-none fixed";
    sticker.style.left = `${left}px`;
    sticker.style.bottom = `${bottom}px`;
    sticker.style.transform = `rotate(${tilt}deg) scale(0.95)`;
    sticker.style.opacity = "0";

    sticker.innerHTML = `
      <div style="border-radius:${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%;"
        class="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-2xl px-4 py-3 w-[280px] max-w-[86vw]">
        <div class="text-sm font-black tracking-wide">${escapeHtml(input.title)}</div>
        <div class="text-xs opacity-95 mt-1 leading-relaxed">${escapeHtml(input.message)}</div>
      </div>
    `;

    root.appendChild(sticker);
    requestAnimationFrame(() => {
      sticker.style.transition = "opacity 180ms ease-out, transform 220ms ease-out";
      sticker.style.opacity = "1";
      sticker.style.transform = `rotate(${tilt}deg) scale(1)`;
    });

    window.setTimeout(() => {
      sticker.style.transition = "opacity 240ms ease-in, transform 240ms ease-in";
      sticker.style.opacity = "0";
      sticker.style.transform = `rotate(${tilt}deg) scale(0.92) translateY(10px)`;
      window.setTimeout(() => sticker.remove(), 300);
    }, 4500);
  }

  function escapeHtml(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setFaceZoomEnabled(next: boolean) {
    faceZoomEnabled = next;
    updateFaceZoomButton();
    if (!faceZoomEnabled) {
      latestFace = null;
      smoothedFace = null;
    }
  }

  function updateFaceZoomButton() {
    if (!faceDetector) {
      faceZoomBtnEl.textContent = "FACE: N/A";
      faceZoomBtnEl.disabled = true;
      faceZoomBtnEl.classList.add("opacity-50", "cursor-not-allowed");
      return;
    }

    faceZoomBtnEl.disabled = false;
    faceZoomBtnEl.classList.remove("opacity-50", "cursor-not-allowed");
    if (faceZoomEnabled) {
      faceZoomBtnEl.textContent = "FACE: ON";
      faceZoomBtnEl.classList.remove("border-emerald-500", "text-emerald-600");
      faceZoomBtnEl.classList.add("border-emerald-700", "text-emerald-700", "bg-emerald-50");
    } else {
      faceZoomBtnEl.textContent = "FACE: OFF";
      faceZoomBtnEl.classList.remove("border-emerald-700", "text-emerald-700", "bg-emerald-50");
      faceZoomBtnEl.classList.add("border-emerald-500", "text-emerald-600");
    }
  }

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  function smoothFaceBox(next: Box) {
    const alpha = 0.35;
    if (!smoothedFace) {
      smoothedFace = next;
      return;
    }
    smoothedFace = {
      x: lerp(smoothedFace.x, next.x, alpha),
      y: lerp(smoothedFace.y, next.y, alpha),
      w: lerp(smoothedFace.w, next.w, alpha),
      h: lerp(smoothedFace.h, next.h, alpha)
    };
  }

  function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  function computeFaceCrop(videoW: number, videoH: number, targetW: number, targetH: number, face: Box) {
    const aspect = targetW / targetH;
    const cx = face.x + face.w / 2;
    const cy = face.y + face.h / 2;

    const desiredFaceRatio = 0.45;
    let cropW = face.w / desiredFaceRatio;
    let cropH = face.h / desiredFaceRatio;

    if (cropW / cropH < aspect) cropW = cropH * aspect;
    else cropH = cropW / aspect;

    // Clamp to avoid absurd zoom / crop outside bounds.
    const minCropW = Math.min(videoW, videoH * aspect) * 0.28;
    const minCropH = Math.min(videoH, videoW / aspect) * 0.28;
    cropW = clamp(cropW, minCropW, videoW);
    cropH = clamp(cropH, minCropH, videoH);

    let sx = cx - cropW / 2;
    let sy = cy - cropH / 2;
    sx = clamp(sx, 0, videoW - cropW);
    sy = clamp(sy, 0, videoH - cropH);
    return { sx, sy, sw: cropW, sh: cropH };
  }

  async function detectFaceOnce() {
    if (!faceDetector) return;
    if (!faceZoomEnabled) return;
    if (detectBusy) return;
    if (videoEl.readyState < 2) return;
    if (!videoEl.videoWidth || !videoEl.videoHeight) return;

    detectBusy = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const faces = (await faceDetector.detect(videoEl as any)) as Array<{ boundingBox: DOMRectReadOnly }>;
      if (!faces || faces.length === 0) {
        latestFace = null;
        return;
      }

      const bb = faces[0].boundingBox;
      latestFace = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
      smoothFaceBox(latestFace);
    } catch (e) {
      console.warn("Face detect failed", e);
    } finally {
      detectBusy = false;
    }
  }

  function startFaceLoop() {
    if (!faceDetector) return;
    if (detectTimer) return;
    detectTimer = window.setInterval(() => {
      void detectFaceOnce();
    }, 200);
    cleanups.push(() => {
      if (detectTimer) window.clearInterval(detectTimer);
      detectTimer = null;
    });
  }

  async function tryLoadPrompts() {
    if (promptsStatus) promptsStatus.textContent = "Loading prompts.json…";
    try {
      const res = await fetch("/prompts.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { userPrompts?: PromptItem[] };
      if (data && Array.isArray(data.userPrompts)) initPromptsFeature(data.userPrompts);
      else throw new Error("Invalid prompts.json");
    } catch (e) {
      console.warn("Prompts JSON load failed. Hiding prompts button.", e);
      if (promptsStatus) promptsStatus.textContent = "Load failed.";
    }
  }

  function initPromptsFeature(prompts: PromptItem[]) {
    promptsBtnEl.classList.remove("hidden");
    if (promptsSidebarBtn) promptsSidebarBtn.classList.remove("hidden");
    if (promptsStatus) promptsStatus.textContent = `Loaded ${prompts.length} prompt(s).`;
    promptsListEl.innerHTML = "";
    prompts.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition";
      const flexDiv = document.createElement("div");
      flexDiv.className = "flex items-start gap-3";
      const indexDiv = document.createElement("div");
      indexDiv.className =
        "bg-blue-100 text-blue-600 font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 text-sm";
      indexDiv.textContent = String(index + 1);
      const contentDiv = document.createElement("div");
      contentDiv.className = "flex-1";
      const p = document.createElement("p");
      p.className =
        "text-gray-800 font-medium text-lg leading-relaxed select-text cursor-text whitespace-pre-wrap break-words font-sans text-sm";
      p.textContent = item.text;
      contentDiv.appendChild(p);

      if (item.imgs && item.imgs.length > 0) {
        const gridDiv = document.createElement("div");
        gridDiv.className = "grid grid-cols-3 gap-2 mt-3";
        item.imgs.forEach((url) => {
          const thumbUrl = url.includes("?") ? `${url}&w=200&h=200&fit=cover` : `${url}?w=200&h=200&fit=cover`;
          const imgWrapper = document.createElement("div");
          imgWrapper.className = "aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200";
          const img = document.createElement("img");
          img.src = thumbUrl;
          img.className = "w-full h-full object-cover hover:scale-110 transition duration-300";
          img.loading = "lazy";
          img.alt = "Prompt result";
          imgWrapper.appendChild(img);
          gridDiv.appendChild(imgWrapper);
        });
        contentDiv.appendChild(gridDiv);
      }

      flexDiv.appendChild(indexDiv);
      flexDiv.appendChild(contentDiv);
      card.appendChild(flexDiv);
      promptsListEl.appendChild(card);
    });

    const open = () => promptsModalEl.classList.remove("hidden");
    const close = () => promptsModalEl.classList.add("hidden");
    onEl(promptsBtnEl, "click", open);
    if (promptsSidebarBtn) onEl(promptsSidebarBtn, "click", open);
    onEl(closeModalBtnEl, "click", close);
    onEl(promptsModalEl, "click", (e) => {
      if (e.target === promptsModalEl) close();
    });
  }

  async function initCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
      statusLightEl.classList.remove("bg-red-500", "shadow-[0_0_10px_red]");
      statusLightEl.classList.add("bg-green-500", "shadow-[0_0_10px_green]");
    } catch {
      videoEl.style.display = "none";
      lensWrapperEl.style.backgroundColor = "#1a1a1a";
    }
    updateControls();
    applyCalibration();
    updateFaceZoomButton();
    startFaceLoop();
    void tryLoadPrompts();

    // 表情分析モデルをバックグラウンドでプリロード
    emotionAnalyzer.loadModels().catch((error) => {
      console.warn('Failed to preload emotion analysis models:', error);
    });
  }

  function applyCalibration() {
    lensWrapperEl.style.top = `${CAMERA_CONFIG.lensTop}%`;
    lensWrapperEl.style.left = `${CAMERA_CONFIG.lensLeft}%`;
    lensWrapperEl.style.width = `${CAMERA_CONFIG.lensSize}%`;
    lensWrapperEl.style.height = `${CAMERA_CONFIG.lensSize}%`;
    lensWrapperEl.style.aspectRatio = "1/1";
    lensWrapperEl.style.opacity = "1";
    shutterBtnEl.style.top = `${CAMERA_CONFIG.btnTop}%`;
    shutterBtnEl.style.left = `${CAMERA_CONFIG.btnLeft}%`;
    shutterBtnEl.style.width = `${CAMERA_CONFIG.btnSize}%`;
    shutterBtnEl.style.aspectRatio = "1/1";
  }

  function playShutterSound() {
    shutterAudio.currentTime = 0;
    void shutterAudio.play().catch((e) => console.warn("Audio play failed", e));
  }

  function applySmartSmooth(ctx: CanvasRenderingContext2D, w: number, h: number, level: number) {
    if (level <= 0) return;
    const srcData = ctx.getImageData(0, 0, w, h);
    const src = srcData.data;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.filter = `blur(${2 + level * 1.5}px)`;
    tempCtx.drawImage(ctx.canvas, 0, 0, w, h);
    const blurData = tempCtx.getImageData(0, 0, w, h);
    const blurred = blurData.data;
    const outData = ctx.createImageData(w, h);
    const dst = outData.data;
    const threshold = 15 + level * 2;
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i],
        g = src[i + 1],
        b = src[i + 2],
        a = src[i + 3];
      const isSkin = r > 45 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10;
      if (isSkin) {
        const diff = Math.abs(r - blurred[i]) + Math.abs(g - blurred[i + 1]) + Math.abs(b - blurred[i + 2]);
        let f = 0;
        if (diff < threshold) {
          f = 1 - diff / threshold;
          f = Math.min((f * level) / 5, 0.8);
        }
        dst[i] = r * (1 - f) + blurred[i] * f;
        dst[i + 1] = g * (1 - f) + blurred[i + 1] * f;
        dst[i + 2] = b * (1 - f) + blurred[i + 2] * f;
      } else {
        dst[i] = r;
        dst[i + 1] = g;
        dst[i + 2] = b;
      }
      dst[i + 3] = a;
    }
    ctx.putImageData(outData, 0, 0);
  }

  function applyWhitening(ctx: CanvasRenderingContext2D, w: number, h: number, level: number) {
    if (level <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = `rgba(255, 250, 240, ${level * 0.06})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  async function analyzePhotoEmotion(imgUrl: string) {
    const loader = showAnalyzingLoader();

    try {
      // モデルをプリロード（まだの場合）
      if (!emotionAnalyzer.isModelLoaded()) {
        await emotionAnalyzer.loadModels();
      }

      // 画像から表情を分析
      const result = await emotionAnalyzer.analyzeEmotionFromBase64(imgUrl);

      loader.hide();

      if (!result) {
        // 顔が検出されなかった
        showNoFaceDetectedMessage();
        speak('顔が検出されませんでした。');
        return;
      }

      // 来場者を記録して統計を更新
      const { visitorNumber, stats } = recordVisitor(result.emotion);

      // インタラクティブな結果を表示
      showInteractiveEmotionResult(result, visitorNumber, stats);

      // 音声で読み上げ
      const emotionData = EMOTIONS[result.emotion];
      if (visitorNumber === 1) {
        speak(`記念すべき最初のお客様です。${emotionData.description}。確信度は${result.confidence}パーセントです。`);
      } else if (visitorNumber % 10 === 0) {
        speak(`${visitorNumber}人目のお客様、ようこそ！${emotionData.description}。確信度は${result.confidence}パーセントです。`);
      } else {
        speak(`${visitorNumber}人目のお客様です。${emotionData.description}。確信度は${result.confidence}パーセントです。`);
      }
    } catch (error) {
      loader.hide();
      console.error('Emotion analysis failed:', error);
      speak('表情分析に失敗しました。');
    }
  }

  function createPolaroidElement(imgUrl: string) {
    const id = `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const div = document.createElement("div");
    div.id = id;
    div.className = "draggable developing in-printer";
    div.style.left = "50%";
    div.style.top = "0px";
    div.style.transform = "translateX(-50%)";

    const card = document.createElement("div");
    card.className = "bg-[#f7f7f7] w-[160px] md:w-[190px] rounded-md shadow-xl p-4 pb-12";

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Polaroid";
    img.className = "w-full aspect-[3/4] object-cover bg-black/20";

    const caption = document.createElement("div");
    caption.className = "handwritten text-center text-gray-700 mt-4 text-xl select-none";
    caption.textContent = "NEW";

    card.appendChild(img);
    card.appendChild(caption);
    div.appendChild(card);

    printerSlotEl.appendChild(div);
    bumpPhotos();

    onEl(div, "mousedown", startDrag);
    onEl(div, "touchstart", startDrag as unknown as (ev: TouchEvent) => void, { passive: false });
    onEl(div, "click", (e) => {
      e.stopPropagation();
      selectPhoto(div);
    });

    setTimeout(() => div.classList.remove("developing"), 2200);

    // 表情分析を実行
    void analyzePhotoEmotion(imgUrl);
  }

  function takePhoto() {
    playShutterSound();
    flashOverlayEl.classList.remove("flash-active");
    void flashOverlayEl.offsetWidth;
    flashOverlayEl.classList.add("flash-active");

    const cvs = document.createElement("canvas");
    const targetW = 600,
      targetH = 800;
    cvs.width = targetW;
    cvs.height = targetH;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const active = videoEl.style.display !== "none";
    const level = Number.parseInt(beautySliderEl.value || "0", 10);

    if (active) {
      const vR = videoEl.videoWidth / videoEl.videoHeight;
      const tR = targetW / targetH;
      let renderW: number, renderH: number, sx: number, sy: number;

      const face = faceZoomEnabled ? smoothedFace ?? latestFace : null;
      if (face && face.w > 0 && face.h > 0) {
        const crop = computeFaceCrop(videoEl.videoWidth, videoEl.videoHeight, targetW, targetH, face);
        sx = crop.sx;
        sy = crop.sy;
        renderW = crop.sw;
        renderH = crop.sh;
      } else {
        if (vR > tR) {
          renderH = videoEl.videoHeight;
          renderW = renderH * tR;
          sx = (videoEl.videoWidth - renderW) / 2;
          sy = 0;
        } else {
          renderW = videoEl.videoWidth;
          renderH = renderW / tR;
          sx = 0;
          sy = (videoEl.videoHeight - renderH) / 2;
        }
      }
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, sx, sy, renderW, renderH, -targetW, 0, targetW, targetH);
      ctx.restore();
      applySmartSmooth(ctx, targetW, targetH, level);
      applyWhitening(ctx, targetW, targetH, level);
    } else {
      ctx.fillStyle = "#151515";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 1200; i++) {
        const x = Math.random() * targetW;
        const y = Math.random() * targetH;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    createPolaroidElement(cvs.toDataURL("image/png"));
  }

  function startDrag(e: MouseEvent | TouchEvent) {
    if ("touches" in e) e.preventDefault();
    dragItem = e.currentTarget as HTMLElement;
    isDragging = false;
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    startPos = { x: cx, y: cy };
    const r = dragItem.getBoundingClientRect();
    dragOffset = { x: cx - r.left, y: cy - r.top };
    selectPhoto(dragItem);
    dragItem.style.zIndex = String(++zIndexCounter);

    const move = onDrag as EventListener;
    const up = stopDrag as EventListener;
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
    const stopListeners = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);
    };
    cleanups.push(stopListeners);
  }

  function onDrag(e: MouseEvent | TouchEvent) {
    if (!dragItem) return;
    if ("touches" in e) e.preventDefault();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    if (!isDragging) {
      if (Math.abs(cx - startPos.x) > 3 || Math.abs(cy - startPos.y) > 3) {
        isDragging = true;
        dragItem.classList.add("is-dragging");
        if (dragItem.parentNode !== document.body) {
          const r = dragItem.getBoundingClientRect();
          dragItem.style.left = `${r.left}px`;
          dragItem.style.top = `${r.top}px`;
          dragItem.style.transform = "none";
          dragItem.getAnimations().forEach((anim) => anim.cancel());
          dragItem.classList.remove("in-printer", "developing");
          document.body.appendChild(dragItem);
        }
      }
    }
    if (isDragging) {
      dragItem.style.left = `${cx - dragOffset.x}px`;
      dragItem.style.top = `${cy - dragOffset.y}px`;
    }
  }

  function stopDrag() {
    if (!dragItem) return;
    dragItem.classList.remove("is-dragging");
    if (isDragging) {
      const gr = galleryZoneEl.getBoundingClientRect();
      const ir = dragItem.getBoundingClientRect();
      if (ir.left + ir.width / 2 > gr.left) dragItem.style.transform = `rotate(${Math.random() * 8 - 4}deg)`;
    }
    dragItem = null;
  }

  function selectPhoto(el: HTMLElement) {
    document.querySelectorAll(".selected-photo").forEach((p) => p.classList.remove("selected-photo"));
    el.classList.add("selected-photo");
    selectedPhotoId = el.id;
    updateControls();
  }

  function deselectAll() {
    document.querySelectorAll(".selected-photo").forEach((p) => p.classList.remove("selected-photo"));
    selectedPhotoId = null;
    updateControls();
  }

  function updateControls() {
    const has = !!selectedPhotoId;
    downloadBtnEl.disabled = !has;
    deleteBtnEl.disabled = !has;
    if (has) deleteBtnEl.classList.remove("hidden");
  }

  const onDocMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest(".draggable") && !target.closest("button") && !target.closest("input") && !target.closest("#prompts-modal")) {
      deselectAll();
    }
  };

  on(document, "mousedown", onDocMouseDown);
  onWindow("resize", applyCalibration);

  onEl(deleteBtnEl, "click", () => {
    if (!selectedPhotoId) return;
    const el = document.getElementById(selectedPhotoId);
    if (el) {
      el.style.transition = "all 0.2s";
      el.style.transform = "scale(0.5)";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }
    deselectAll();
  });

  onEl(downloadBtnEl, "click", () => {
    if (!selectedPhotoId) return;
    const el = document.getElementById(selectedPhotoId);
    if (!el) return;
    const cvs = document.getElementById("render-canvas") as HTMLCanvasElement | null;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const img = el.querySelector("img") as HTMLImageElement | null;
    const txt = (el.querySelector(".handwritten") as HTMLElement | null)?.innerText ?? "";
    if (!img) return;
    const W = 600,
      H = 860,
      P = 40;
    cvs.width = W;
    cvs.height = H;
    ctx.fillStyle = "#fdfdfd";
    ctx.fillRect(0, 0, W, H);
    const iW = W - 80;
    const iH = iW * (4 / 3);
    ctx.drawImage(img, P, P, iW, iH);
    ctx.fillStyle = "#333";
    ctx.font = '40px "Permanent Marker"';
    ctx.textAlign = "center";
    ctx.fillText(txt, W / 2, H - 60);
    const a = document.createElement("a");
    a.download = `polaroid-${Date.now()}.png`;
    a.href = cvs.toDataURL();
    a.click();
  });

  onEl(shutterBtnEl, "click", () => takePhoto());
  onEl(beautySliderEl, "input", () => {
    beautyValEl.innerText = beautySliderEl.value;
  });
  onEl(faceZoomBtnEl, "click", () => setFaceZoomEnabled(!faceZoomEnabled));
  if (testShutterBtn) onEl(testShutterBtn, "click", playShutterSound);

  void initCamera();
  initStats();

  return () => {
    cleanups.forEach((fn) => fn());
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };
}
