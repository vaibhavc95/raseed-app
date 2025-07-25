<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="receipt-upload-container">
      <div
        class="receipt-drop-area"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="cameraActive" class="receipt-camera-feed">
          <video
            ref="cameraVideo"
            autoplay
            playsinline
            style="width: 100%; max-height: 260px; border-radius: 16px; background: #000;"
          ></video>
        </div>
        <div v-else class="receipt-drop-content">
          <div class="receipt-drop-icons">
            <q-icon name="photo_camera" color="primary" size="40px" class="receipt-drop-icon" />
            <q-icon name="videocam" color="accent" size="40px" class="receipt-drop-icon" />
            <q-icon name="description" color="purple" size="40px" class="receipt-drop-icon" />
          </div>
          <div class="receipt-drop-title">Drop your receipt here</div>
          <div class="receipt-drop-desc">Photos, videos, or livestreams in any language</div>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,video/*"
          class="hidden"
          @change="onFilesSelected"
        />
      </div>
      <div v-if="cameraActive" class="receipt-camera-actions-outside">
        <q-btn
          v-if="cameraMode === 'image'"
          color="primary"
          icon="photo_camera"
          label="Capture"
          @click="capturePhoto"
          class="receipt-camera-btn"
          rounded
          unelevated
          size="lg"
        />
        <q-btn
          v-if="cameraMode === 'video' && !recording"
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
          v-if="cameraMode === 'video' && recording"
          color="negative"
          icon="stop"
          label="Stop"
          @click="stopRecording"
          class="receipt-camera-btn"
          rounded
          unelevated
          size="lg"
        />
        <q-btn
          flat
          icon="close"
          color="grey"
          @click="closeCamera"
          class="receipt-camera-btn"
          rounded
          unelevated
          size="lg"
        />
      </div>
      <div class="receipt-action-row">
        <q-btn flat class="receipt-action-btn" @click="openCamera('image')">
          <q-icon name="photo_camera" class="q-mr-sm" /> Photo
        </q-btn>
        <q-btn flat class="receipt-action-btn" @click="openCamera('video')">
          <q-icon name="videocam" class="q-mr-sm" /> Video
        </q-btn>
        <q-btn flat class="receipt-action-btn" @click="triggerFileSelect">
          <q-icon name="description" class="q-mr-sm" /> File
        </q-btn>
      </div>
      <div v-if="files.length" class="receipt-preview-row">
        <div v-for="(file, idx) in files" :key="file.id" class="receipt-preview-item">
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
            v-if="file.type && file.type.startsWith('image/')"
            :src="file.preview"
            :alt="file.name"
            style="max-width: 80px; max-height: 80px;"
          />
          <video
            v-else-if="file.type && file.type.startsWith('video/')"
            :src="file.preview"
            controls
            style="max-width: 100px; max-height: 80px;"
          />
          <div class="receipt-preview-name">{{ file.name }}</div>
        </div>
      </div>
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
import { ref, nextTick } from 'vue';

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
  for (const file of newFiles) {
    file.id = `${file.name}-${file.size}-${Date.now()}`;
    file.preview = URL.createObjectURL(file);
  }
  files.value = [...files.value, ...newFiles];
}

async function openCamera(mode) {
  cameraMode.value = mode;
  cameraActive.value = true;
  await nextTick();
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: mode === 'video'
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
      file.id = `${file.name}-${file.size}-${Date.now()}`;
      file.preview = URL.createObjectURL(file);
      files.value.push(file);
    }
    closeCamera();
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

function removeFile(idx) {
  files.value.splice(idx, 1);
}

async function submitRaseed() {
  loading.value = true;
  success.value = false;
  error.value = '';
  try {
    // ...your upload logic here...
    // For prototype, just simulate success:
    await new Promise(res => setTimeout(res, 1200));
    success.value = true;
    files.value = [];
  } catch (err) {
    error.value = err.message || 'Failed to upload receipts';
  } finally {
    loading.value = false;
  }
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
  border: 2.5px dashed #e0e7ef;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%);
  min-height: 180px;
  width: 100%;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 6px 0 rgba(60,64,67,.04);
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
}

.receipt-preview-name {
  font-size: 0.92rem;
  color: #374151;
  margin-top: 6px;
  text-align: center;
  word-break: break-all;
}

.receipt-remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
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
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0 0 0;
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
  gap: 18px;
  margin: 18px 0 0 0;
  width: 100%;
}

.receipt-camera-btn {
  min-width: 110px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>