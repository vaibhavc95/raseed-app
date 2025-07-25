<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="receipt-upload-container">
      <div
        class="receipt-drop-area"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop.prevent="handleDrop"
        @click="!cameraActive && triggerFileSelect()"
        style="user-select: none;"
      >
        <!-- Close button at top right when camera is active -->
        <q-btn
          v-if="cameraActive"
          icon="close"
          round
          unelevated
          color="grey-8"
          class="receipt-camera-close-btn"
          @click.stop="closeCamera"
          aria-label="Close camera"
        />
        <div v-if="cameraActive" class="receipt-camera-feed">
          <video
            ref="cameraVideo"
            autoplay
            playsinline
            class="receipt-camera-video"
          ></video>
        </div>
        <div v-else class="receipt-drop-content">
          <div class="receipt-drop-icons">
            <q-icon name="photo_camera" color="primary" size="40px" class="receipt-drop-icon" />
            <q-icon name="description" color="purple" size="40px" class="receipt-drop-icon" />
            <q-icon name="picture_as_pdf" color="red" size="40px" class="receipt-drop-icon" />
          </div>
          <div class="receipt-drop-title">Add your receipts</div>
          <div class="receipt-drop-desc">
            Click to select images or PDFs, <br /> or drag files here
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,application/pdf"
          class="hidden"
          @change="onFilesSelected"
        />
      </div>
      <!-- Video controls (if enabled) -->
      <div v-if="cameraActive && cameraMode === 'video' && showVideo" class="receipt-camera-actions-outside">
        <q-btn
          v-show="!recording"
          color="primary"
          icon="fiber_manual_record"
          label="Record"
          @click="startRecording"
          class="receipt-camera-btn"
          rounded
          unelevated
          size="lg"
        />
        <q-btn
          v-show="recording"
          color="negative"
          icon="stop"
          label="Stop"
          @click="stopRecording"
          class="receipt-camera-btn"
          rounded
          unelevated
          size="lg"
        />
      </div>
      <div class="receipt-action-row">
        <!-- Photo button (when camera is closed) -->
        <q-btn
          flat
          class="receipt-action-btn"
          v-if="!cameraActive"
          @click="openCamera('image')"
        >
          <q-icon name="photo_camera" class="q-mr-sm" /> Photo
          <span v-if="totalPhotoCount > 0" style="margin-left: 6px; display: inline-flex; align-items: center;">
            <q-icon name="photo" size="16px" color="primary" style="margin-right: 2px;" />
            <span style="font-size: 0.82em; color: #10b981; font-weight: 600;">{{ totalPhotoCount }}</span>
          </span>
          <span v-if="pdfCount > 0" style="margin-left: 8px; display: inline-flex; align-items: center;">
            <q-icon name="picture_as_pdf" size="16px" color="red" style="margin-right: 2px;" />
            <span style="font-size: 0.82em; color: #e11d48; font-weight: 600;">{{ pdfCount }}</span>
          </span>
        </q-btn>
        <!-- Capture button (when camera is open) -->
        <q-btn
          flat
          class="receipt-action-btn"
          v-else-if="cameraActive && cameraMode === 'image'"
          color="primary"
          icon="photo_camera"
          @click="capturePhoto"
        >
          Capture
          <span
            v-if="sessionPhotoCount > 0"
            style="font-size: 0.82em; color: #10b981; margin-left: 6px; font-weight: 600;"
          >
            ({{ sessionPhotoCount }})
          </span>
        </q-btn>
        <!-- File button -->
        <!-- <q-btn flat class="receipt-action-btn" @click="triggerFileSelect">
          <q-icon name="description" class="q-mr-sm" /> File
          <span
            v-if="pdfCount > 0"
            style="font-size: 0.82em; color: #e11d48; margin-left: 6px; font-weight: 600;"
          >
            ({{ pdfCount }})
          </span>
        </q-btn> -->
      </div>
      <div v-if="files.length" class="receipt-preview-row">
        <div v-for="(item, idx) in files" :key="item.id" class="receipt-preview-item">
          <q-btn
            dense
            flat
            round
            icon="close"
            color="negative"
            size="sm"
            class="receipt-remove-btn"
            @click="removeFile(idx)"
            aria-label="Remove file"
            style="position: absolute; top: 2px; right: 2px; z-index: 2;"
          />
          <q-img
            v-if="item.type && item.type.startsWith('image/')"
            :src="item.preview"
            :alt="item.name"
            class="receipt-preview-thumb"
          />
          
          <div v-else-if="item.type === 'application/pdf'" class="receipt-preview-pdf">
            <q-icon name="picture_as_pdf" color="red" size="48px" />
            <div class="receipt-preview-name">{{ crispName(item.name) }}</div>
          </div>
          
          <video
            v-else-if="showVideo && item.type && item.type.startsWith('video/')"
            :src="item.preview"
            controls
            style="max-width: 100px; max-height: 80px;"
          />
          <div v-else class="receipt-preview-name">{{ crispName(item.name) }}</div>
            <!-- <pre>{{ files }}</pre> -->
        </div>
      </div>
      <!-- Show thumbnails and counter only while camera is open and in photo mode -->
      <!-- <div
        v-if="cameraActive && cameraMode === 'image' && capturedPhotos.length"
        class="receipt-captured-thumbnails"
      >
        <div class="receipt-captured-counter">
          {{ capturedPhotos.length }} photo{{ capturedPhotos.length > 1 ? 's' : '' }} captured
        </div>
        <div class="receipt-captured-thumbs">
          <img
            v-for="(photo, idx) in capturedPhotos"
            :key="photo.id"
            :src="photo.preview"
            class="receipt-captured-thumb"
            :alt="`Captured photo ${idx + 1}`"
          />
        </div>
      </div> -->
      <q-btn
        class="receipt-upload-btn"
        :loading="loading"
        :disable="files.length === 0"
        @click="submitRaseed"
      >
        Upload & Analyze
      </q-btn>
      <div v-if="success" class="text-positive text-center q-mt-md">
        Raseed created successfully!
      </div>
      <div v-if="error" class="text-negative text-center q-mt-md">{{ error }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';

const showVideo = false;

const files = ref([]);
const loading = ref(false);
const success = ref(false);
const error = ref('');
const dragActive = ref(false);
const fileInput = ref(null);

// Camera state
const cameraActive = ref(false);
const cameraMode = ref('image');
const cameraStream = ref(null);
const cameraVideo = ref(null);
const recording = ref(false);
let mediaRecorder = null;
let recordedChunks = [];

// Captured photos state (for current camera session)
const capturedPhotos = ref([]);

// Counter for images (photos) in files
const totalPhotoCount = computed(() =>
  files.value.filter(item => item.type && item.type.startsWith('image/')).length
);
const pdfCount = computed(() =>
  files.value.filter(item => item.type === 'application/pdf').length
);
const otherFileCount = computed(() =>
  files.value.filter(item => !(item.type && (item.type.startsWith('image/') || item.type === 'application/pdf'))).length
);
// Counter for photos in current camera session
const sessionPhotoCount = computed(() => capturedPhotos.value.length);

function removeFile(idx) {
  const removed = files.value[idx];
  files.value.splice(idx, 1);
  // Remove from capturedPhotos if it was a captured photo
  const capIdx = capturedPhotos.value.findIndex(f => f.id === removed.id);
  if (capIdx !== -1) capturedPhotos.value.splice(capIdx, 1);
}

function triggerFileSelect() {
  fileInput.value.click();
}

function onFilesSelected(e) {
  addFiles([...e.target.files]);
  e.target.value = '';
}

function handleDrop(e) {
  dragActive.value = false;
  addFiles([...e.dataTransfer.files]);
}

function addFiles(newFiles) {
  const wrappedFiles = newFiles.map(file => ({
    file,
    id: `${file.name}-${file.size}-${Date.now()}`,
    name: file.name,
    type: file.type,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
  }));
  files.value = [...files.value, ...wrappedFiles];
}

async function openCamera(mode) {
  cameraMode.value = mode;
  cameraActive.value = true;
  await nextTick();
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: showVideo && mode === 'video'
    });
    cameraVideo.value.srcObject = cameraStream.value;
  } catch (err) {
    error.value = 'Unable to access camera: ' + err.message;
    cameraActive.value = false;
  }
}

function closeCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
  }
  cameraActive.value = false;
  recording.value = false;
  mediaRecorder = null;
  recordedChunks = [];
  capturedPhotos.value = [];
}

async function capturePhoto() {
  const video = cameraVideo.value;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (blob) {
      const file = new File([blob], `photo-${Date.now()}.png`, { type: 'image/png' });
      const wrapped = {
        file,
        id: `${file.name}-${file.size}-${Date.now()}`,
        name: file.name,
        type: file.type,
        preview: URL.createObjectURL(file),
      };
      files.value.push(wrapped);
      capturedPhotos.value.push(wrapped);
    }
  }, 'image/png');
}

function startRecording() {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(cameraStream.value, { mimeType: 'video/webm' });
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
    file.id = `${file.name}-${file.size}-${Date.now()}`;
    file.preview = URL.createObjectURL(file);
    files.value.push(file);
    closeCamera();
  };
  mediaRecorder.start();
  recording.value = true;
}

function stopRecording() {
  if (mediaRecorder && recording.value) {
    mediaRecorder.stop();
    recording.value = false;
  }
}

async function submitRaseed() {
  loading.value = true;
  success.value = false;
  error.value = '';
  try {
    // ...your upload logic here...
    await new Promise(res => setTimeout(res, 1200));
    success.value = true;
    files.value = [];
  } catch (err) {
    error.value = err.message || 'Failed to upload receipts';
  } finally {
    loading.value = false;
  }
}

function crispName(name, max = 16) {
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  return name.slice(0, max - ext.length - 5) + '...' + ext;
}
</script>

<style scoped>
.receipt-upload-container {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 16px 0 rgba(60,64,67,.10), 0 1.5px 4px rgba(60,64,67,.06);
  padding: 40px 32px 32px 32px;
  width: 100%;
  max-width: 700px;
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.receipt-drop-area {
  position: relative; /* Needed for absolute close btn */
  border: 2.5px dashed #22c55e; /* Greenish shade */
  border-radius: 24px;
  background: linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%);
  width: 320px;
  height: 320px;
  max-width: 90vw;
  max-height: 90vw;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px 0 rgba(34,197,94,.06);
}

.receipt-drop-area:hover,
.receipt-drop-area:focus,
.receipt-drop-area.active {
  border-color: #60a5fa;
  box-shadow: 0 4px 16px 0 rgba(60,64,67,.10);
}

.receipt-drop-content {
  text-align: center;
}

.receipt-drop-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.receipt-drop-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #222;
  letter-spacing: 0.01em;
}

.receipt-drop-desc {
  color: #7b8794;
  font-size: 1.05rem;
  font-weight: 400;
}

.receipt-action-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
  gap: 16px;
}

.receipt-action-btn {
  flex: 1 1 0;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 500;
  background: #f4f8fb;
  transition: background 0.18s, border-color 0.18s, transform 0.18s;
  box-shadow: 0 1px 4px rgba(60,64,67,.04);
  padding: 12px 0;
  color: #222;
}
.receipt-action-btn:hover,
.receipt-action-btn:focus {
  background: #e8f0fe;
  border-color: #60a5fa;
  transform: scale(1.04);
  color: #2563eb;
}

.receipt-preview-row {
  display: flex;
  gap: 18px;
  margin-bottom: 28px;
  width: 100%;
  flex-wrap: wrap;
}

.receipt-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100px;
  background: #f8fafc;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(60,64,67,.04);
  padding: 8px 4px 4px 4px;
  position: relative;
  margin-top: 18px; /* Add space for the remove button above */
}

.receipt-preview-name {
  font-size: 0.92rem;
  color: #374151;
  margin-top: 6px;
  text-align: center;
  word-break: break-all;
}

.receipt-preview-pdf .receipt-preview-name {
  max-width: 90px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 0.92rem;
  color: #374151;
  margin-top: 6px;
  cursor: pointer;
}
@media (max-width: 600px) {
  .receipt-preview-pdf .receipt-preview-name {
    max-width: 70px;
    font-size: 0.85rem;
  }
}

.receipt-remove-btn {
  position: absolute;
  top: -16px;   /* Move above the image */
  right: 2px;
  z-index: 2;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60,64,67,.10);
}

.receipt-upload-btn {
  width: 100%;
  margin-top: 10px;
  background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(60,64,67,.08);
  letter-spacing: 0.01em;
  padding: 14px 0;
  transition: box-shadow 0.18s, transform 0.18s;
}
.receipt-upload-btn:hover,
.receipt-upload-btn:focus {
  box-shadow: 0 6px 24px rgba(60,64,67,.12);
  transform: scale(1.01);
}
.receipt-camera-feed {
  width: 100%;
  height: 100%;
  min-height: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.receipt-camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  background: #000;
  aspect-ratio: 1 / 1;
  min-width: 320px;
  min-height: 320px;
  max-width: 320px;
  max-height: 320px;
}

.receipt-camera-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 18px;
  width: 100%;
}

.receipt-camera-actions-outside {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;           /* Less gap for minimal look */
  margin: 8px 0 0 0;   /* Less margin above */
  width: 100%;
  min-height: 44px;    /* Slightly smaller for minimalism */
}

.receipt-camera-btn {
  min-width: 80px;     /* Smaller button width */
  padding: 0 10px;     /* Less horizontal padding */
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: 12px;
}

.receipt-camera-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60,64,67,.10);
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.92;
  transition: background 0.18s, box-shadow 0.18s;
}
.receipt-camera-close-btn:hover,
.receipt-camera-close-btn:focus {
  background: #f1f5f9;
  box-shadow: 0 4px 16px rgba(60,64,67,.16);
  opacity: 1;
}

.receipt-captured-thumbnails {
  width: 100%;
  margin: 8px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.receipt-captured-counter {
  font-size: 0.98rem;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 4px;
  margin-left: 2px;
}

.receipt-captured-thumbs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.receipt-captured-thumb {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 8px;
  border: 1.5px solid #22c55e;
  background: #fff;
}

.receipt-preview-thumb,
.receipt-preview-item q-img,
.receipt-preview-item img {
  width: 80px;
  height: 80px;
  min-width: 60px;
  min-height: 60px;
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  display: block;
}

.receipt-preview-pdf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  min-width: 60px;
  min-height: 60px;
  max-width: 100px;
  max-height: 100px;
  background: #fff;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .receipt-preview-thumb,
  .receipt-preview-item q-img,
  .receipt-preview-item img {
    width: 60px;
    height: 60px;
    min-width: 40px;
    min-height: 40px;
    max-width: 80px;
    max-height: 80px;
  }

  .receipt-preview-pdf {
    width: 60px;
    height: 60px;
    min-width: 40px;
    min-height: 40px;
    max-width: 80px;
    max-height: 80px;
  }
}

@media (max-width: 400px) {
  .receipt-drop-area {
    width: 90vw;
    height: 90vw;
    min-width: 0;
    min-height: 0;
  }
}
</style>