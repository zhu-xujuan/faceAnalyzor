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
    !closeModalBtn
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

  let stream: MediaStream | null = null;

  type PromptItem = { text: string; imgs?: string[] };

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
    void tryLoadPrompts();
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

    onEl(div, "mousedown", startDrag);
    onEl(div, "touchstart", startDrag as unknown as (ev: TouchEvent) => void, { passive: false });
    onEl(div, "click", (e) => {
      e.stopPropagation();
      selectPhoto(div);
    });

    setTimeout(() => div.classList.remove("developing"), 2200);
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
  if (testShutterBtn) onEl(testShutterBtn, "click", playShutterSound);

  void initCamera();

  return () => {
    cleanups.forEach((fn) => fn());
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };
}
