<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="receipt-upload-container">
      <!-- Initial Upload UI -->
      <div v-if="!receiptData">
        <div
          class="receipt-drop-area"
          :class="{ active: dragActive }"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
          @click="!cameraActive && triggerFileSelect()"
          style="user-select: none"
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
              <q-icon
                name="photo_camera"
                color="primary"
                size="40px"
                class="receipt-drop-icon"
              />
              <q-icon
                name="description"
                color="purple"
                size="40px"
                class="receipt-drop-icon"
              />
              <q-icon
                name="picture_as_pdf"
                color="red"
                size="40px"
                class="receipt-drop-icon"
              />
            </div>
            <div class="receipt-drop-title">Add your receipts</div>
            <div class="receipt-drop-desc">
              Click to select images or PDFs, <br />
              or drag files here
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
        <div class="receipt-action-row">
          <!-- Photo button (when camera is closed) -->
          <q-btn
            flat
            class="receipt-action-btn"
            v-if="!cameraActive"
            @click="openCamera('image')"
          >
            <q-icon name="photo_camera" class="q-mr-sm" /> Photo
            <span
              v-if="totalPhotoCount > 0"
              style="
                margin-left: 6px;
                display: inline-flex;
                align-items: center;
              "
            >
              <q-icon
                name="photo"
                size="16px"
                color="primary"
                style="margin-right: 2px"
              />
              <span
                style="font-size: 0.82em; color: #10b981; font-weight: 600"
                >{{ totalPhotoCount }}</span
              >
            </span>
            <span
              v-if="pdfCount > 0"
              style="
                margin-left: 8px;
                display: inline-flex;
                align-items: center;
              "
            >
              <q-icon
                name="picture_as_pdf"
                size="16px"
                color="red"
                style="margin-right: 2px"
              />
              <span
                style="font-size: 0.82em; color: #e11d48; font-weight: 600"
                >{{ pdfCount }}</span
              >
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
              style="
                font-size: 0.82em;
                color: #10b981;
                margin-left: 6px;
                font-weight: 600;
              "
            >
              ({{ sessionPhotoCount }})
            </span>
          </q-btn>
        </div>

        <div v-if="files.length" class="receipt-preview-row">
          <div
            v-for="(item, idx) in files"
            :key="item.id"
            class="receipt-preview-item"
          >
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
              style="position: absolute; top: 2px; right: 2px; z-index: 2"
            />
            <q-img
              v-if="item.type && item.type.startsWith('image/')"
              :src="item.preview"
              :alt="item.name"
              class="receipt-preview-thumb"
            />

            <div
              v-else-if="item.type === 'application/pdf'"
              class="receipt-preview-pdf"
            >
              <q-icon name="picture_as_pdf" color="red" size="48px" />
              <div class="receipt-preview-name">{{ crispName(item.name) }}</div>
            </div>
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

        <div v-if="error" class="text-negative text-center q-mt-md">
          {{ error }}
        </div>
      </div>

      <!-- Receipt History UI (if wanted) -->
      <div v-else-if="showHistory" class="receipt-history-section">
        <!-- Receipt history UI here -->
      </div>
    </div>

    <!-- Receipt Editor Modal -->
    <receipt-editor
      :receipt="receiptData"
      :is-open="showReceiptEditor"
      @update:is-open="showReceiptEditor = $event"
      @save="saveReceiptData"
      @cancel="cancelEdit"
    />

    <!-- Error Dialog -->
    <q-dialog v-model="errorDialogVisible">
      <q-card class="error-dialog-card">
        <q-card-section class="row items-center">
          <div class="column items-center col-auto q-mr-md">
            <q-icon
              :name="errorDialogData.icon || 'error'"
              :color="errorDialogData.color || 'negative'"
              size="48px"
            />
          </div>
          <div class="col text-h6">{{ errorDialogData.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-body1 q-mb-sm">{{ errorDialogData.message }}</p>
          <p class="text-caption text-grey-8">{{ errorDialogData.details }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Try Again" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Wallet Dialog -->
    <q-dialog v-model="walletDialogVisible" persistent>
      <q-card class="wallet-dialog-card">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Receipt Saved Successfully!</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeWalletDialogAndRedirect" />
        </q-card-section>

        <q-card-section class="q-pt-lg q-px-lg">
          <div class="text-center">
            <q-icon name="check_circle" color="positive" size="64px" />
            <p class="text-h6 q-mt-md">Your receipt has been processed</p>
            <p class="text-body1 q-mb-lg">Add this receipt to Google Wallet for easy access</p>
            
            <!-- Google Wallet Button -->
            <a href="javascript:void(0)" @click="redirectToGoogleWallet" class="google-wallet-button">
              <div class="google-wallet-button-content">
                <img src="https://lh3.googleusercontent.com/8lpANuj1pRxX98RKx1AbAz74EP8jnUirTvlGHFwN9HKY_CyOgon_PC5SH3_kWLh_KQ=w96-rw" 
                     alt="Google Wallet" 
                     class="google-wallet-logo" />
                <span>Add to Google Wallet</span>
              </div>
            </a>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import secureAxios from 'src/boot/secureAxios';
import { userStore } from 'src/stores/userStore';
import ReceiptEditor from 'src/components/ReceiptEditor.vue';
import { useRouter } from 'vue-router';

// State management
const files = ref([]);
const loading = ref(false);
const error = ref('');
const dragActive = ref(false);
const fileInput = ref(null);

// Camera state
const cameraActive = ref(false);
const cameraMode = ref('image');
const cameraStream = ref(null);
const cameraVideo = ref(null);

// Captured photos state (for current camera session)
const capturedPhotos = ref([]);

// Receipt data and UI state
const receiptData = ref(null);
const showReceiptEditor = ref(false);
const showHistory = ref(false);
const currentIdentifier = ref('');
const savedReceipts = ref([]);

// Router instance
const router = useRouter();

// Counter for images (photos) in files
const totalPhotoCount = computed(() =>
  files.value.filter(item => item.type && item.type.startsWith('image/')).length
);
const pdfCount = computed(() =>
  files.value.filter(item => item.type === 'application/pdf').length
);
// Counter for photos in current camera session
const sessionPhotoCount = computed(() => capturedPhotos.value.length);

// Load saved identifiers on component mount
onMounted(() => {
  loadSavedIdentifiers();
});

// Load any saved receipt identifiers from localStorage
function loadSavedIdentifiers() {
  try {
    const savedIds = localStorage.getItem('raseed_receipt_ids');
    if (savedIds) {
      const parsedIds = JSON.parse(savedIds);
      if (Array.isArray(parsedIds)) {
        savedReceipts.value = parsedIds;
      }
    }
  } catch (err) {
    console.error('Error loading saved receipt IDs', err);
  }
}

// Save a new receipt identifier to localStorage
function saveIdentifierToStorage(identifier) {
  try {
    const currentIds = [...savedReceipts.value];
    if (!currentIds.includes(identifier)) {
      currentIds.push(identifier);
      savedReceipts.value = currentIds;
      localStorage.setItem('raseed_receipt_ids', JSON.stringify(currentIds));
    }
  } catch (err) {
    console.error('Error saving receipt ID', err);
  }
}

function removeFile(idx) {
  const removed = files.value[idx];
  // Release the URL object to prevent memory leaks
  if (removed.preview) {
    URL.revokeObjectURL(removed.preview);
  }  
  files.value.splice(idx, 1);
  // Remove from capturedPhotos if it was a captured photo
  const capIdx = capturedPhotos.value.findIndex(f => f.id === removed.id);
  if (capIdx !== -1) capturedPhotos.value.splice(capIdx, 1);
}
// Also add cleanup on component unmount
onBeforeUnmount(() => {
  // Clean up all file previews
  files.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
  
  // Clean up camera if it's still active
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
  }
});

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
      audio: false
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

async function submitRaseed() {
  if (files.value.length === 0) {
    error.value = 'Please select at least one file to upload';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    // Create form data for API request
    const formData = new FormData();
    
    // Generate a unique identifier using user ID and timestamp
    const userId = userStore.user?.sub || userStore.user?.google_id || 'unknown-user';
    const timestamp = Date.now();
    const identifier = `${userId}-${timestamp}`;
    
    // Add the identifier to the form data
    formData.append('identifier', identifier);
    
    // Add all files to the form data
    files.value.forEach((fileObj, index) => {
      formData.append(`files`, fileObj.file);
    });
    
    // Send the request to the backend
    const response = await secureAxios.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Receipt upload response:', response.data);
    
    // Check if the response contains an error field
    if (response.data.error) {
      throw { 
        response: { 
          data: { error: response.data.error } 
        } 
      };
    }
    
    // Store the response data and identifier
    receiptData.value = response.data;
    currentIdentifier.value = identifier;
    saveIdentifierToStorage(identifier);
    
    // Show the receipt editor
    showReceiptEditor.value = true;
    
    // Clear files after successful upload
    files.value = [];
    
  } catch (err) {
    console.error('Error uploading receipts:', err);
    
    // Handle specific error types gracefully
    if (err.response?.data?.error) {
      const errorMsg = err.response.data.error;
      
      // Check for Gemini quota exceeded error
      if (errorMsg.includes('RESOURCE_EXHAUSTED') && errorMsg.includes('exceeded your current quota')) {
        // Show user-friendly quota error message
        showErrorDialog({
          title: 'AI Service Limit Reached',
          message: 'Our AI service has reached its processing limit. Please try again later.',
          details: 'The Google Gemini API has a daily limit on free tier usage. You can try again tomorrow.',
          icon: 'schedule',
          color: 'amber-8'
        });
        return;
      }
      
      // Check for other OCR errors
      if (errorMsg.includes('Failed to perform OCR')) {
        showErrorDialog({
          title: 'Receipt Processing Issue',
          message: 'We had trouble reading your receipt. Please try with a clearer image.',
          details: 'Make sure the receipt is well-lit and text is clearly visible.',
          icon: 'image_not_supported',
          color: 'deep-orange'
        });
        return;
      }
      
      // Generic error with the actual message
      error.value = 'Upload failed: ' + getSimplifiedErrorMessage(errorMsg);
    } else {
      // Default error message
      error.value = 'Failed to upload receipts. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}

// Helper function to simplify complex error messages
function getSimplifiedErrorMessage(errorMsg) {
  // If it's a string representation of JSON, try to extract useful parts
  if (typeof errorMsg === 'string' && (errorMsg.includes('{') || errorMsg.includes('}'))) {
    try {
      // Try to find a user-friendly message in the error structure
      if (errorMsg.includes('message')) {
        const match = errorMsg.match(/'message':\s*'([^']+)'/);
        if (match && match[1]) {
          return match[1].split('.')[0]; // Just the first sentence
        }
      }
      
      // Fall back to a simplified version
      return 'Processing error. Please try again later.';
    } catch (e) {
      // If parsing fails, return a shortened version
      return errorMsg.substring(0, 100) + (errorMsg.length > 100 ? '...' : '');
    }
  }
  
  return errorMsg;
}

// Add this function and ref for the error dialog
const errorDialogVisible = ref(false);
const errorDialogData = ref({
  title: '',
  message: '',
  details: '',
  icon: '',
  color: ''
});

function showErrorDialog(data) {
  errorDialogData.value = data;
  errorDialogVisible.value = true;
}
function cancelEdit() {
  // Reset data and close editor
  receiptData.value = null;
  showReceiptEditor.value = false;
}
async function saveReceiptData(editedData) {
  loading.value = true;
  error.value = '';
  
  try {
    // Extract identifier and data from the object received from ReceiptEditor
    const { identifier, data } = editedData;
    
    // Use identifier as a query parameter
    const response = await secureAxios.post(`/receipts/save?identifier=${identifier}`, data);
    
    // Show Google Wallet dialog if URL is available
    if (response.data && response.data.add_to_wallet_url) {
      walletDialogData.value = {
        receipt_id: response.data.receipt_id,
        add_to_wallet_url: response.data.add_to_wallet_url
      };
      walletDialogVisible.value = true;
    } else {
      // If no wallet URL is available, just show success and reset
      errorDialogData.value = {
        title: 'Receipt Saved',
        message: 'Your receipt has been successfully saved.',
        details: '',
        icon: 'check_circle',
        color: 'positive'
      };
      errorDialogVisible.value = true;
      
      // Reset after a short delay
      setTimeout(() => {
        errorDialogVisible.value = false;
        receiptData.value = null;
        showReceiptEditor.value = false;
      }, 1500);
    }
    
  } catch (err) {
    console.error('Error saving receipt data:', err);
    
    showErrorDialog({
      title: 'Save Failed',
      message: 'We couldn\'t save your receipt data.',
      details: err.response?.data?.message || err.message || 'Please try again.',
      icon: 'error',
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
}

// Add these refs for the wallet dialog
const walletDialogVisible = ref(false);
const walletDialogData = ref({
  receipt_id: null,
  add_to_wallet_url: ''
});

// Function to redirect to Google Wallet
function redirectToGoogleWallet() {
  // Open Google Wallet URL in a new tab
  window.open(walletDialogData.value.add_to_wallet_url, '_blank');
  
  // Close the dialog and reset the page
  closeWalletDialogAndRedirect();
}

// Function to close wallet dialog and return to create-raseed page
function closeWalletDialogAndRedirect() {
  walletDialogVisible.value = false;
  receiptData.value = null;
  showReceiptEditor.value = false;
  router.push('/create-raseed');
}

// Simple toast function if you don't already have one
function showSuccessToast(message) {
  const { Notify } = require('quasar');
  Notify.create({
    message,
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
    timeout: 2000
  });
}
</script>

<style scoped>
.receipt-upload-container {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 16px 0 rgba(60, 64, 67, 0.1),
    0 1.5px 4px rgba(60, 64, 67, 0.06);
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
  box-shadow: 0 2px 12px 0 rgba(34, 197, 94, 0.06);
}

.receipt-drop-area:hover,
.receipt-drop-area:focus,
.receipt-drop-area.active {
  border-color: #60a5fa;
  box-shadow: 0 4px 16px 0 rgba(60, 64, 67, 0.1);
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
  box-shadow: 0 1px 4px rgba(60, 64, 67, 0.04);
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
  box-shadow: 0 1px 4px rgba(60, 64, 67, 0.04);
  padding: 8px 4px 4px 4px;
  position: relative;
  margin-top: 18px; /* Add space for the remove button above */
}

.receipt-preview-name {
  font-size: 0.62rem;
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
  font-size: 0.62rem;
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
  top: -16px; /* Move above the image */
  right: 2px;
  z-index: 2;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60, 64, 67, 0.1);
}

.receipt-upload-btn {
  width: 100%;
  margin-top: 10px;
  background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(60, 64, 67, 0.08);
  letter-spacing: 0.01em;
  padding: 14px 0;
  transition: box-shadow 0.18s, transform 0.18s;
}
.receipt-upload-btn:hover,
.receipt-upload-btn:focus {
  box-shadow: 0 6px 24px rgba(60, 64, 67, 0.12);
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

.receipt-camera-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60, 64, 67, 0.1);
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
  box-shadow: 0 4px 16px rgba(60, 64, 67, 0.16);
  opacity: 1;
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
  .receipt-upload-container {
    padding: 24px 16px 20px 16px;
  }

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

/* Add to the style section */
.error-dialog-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
}

.wallet-dialog-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
}

.google-wallet-button {
  display: inline-block;
  background-color: #4285f4;
  border-radius: 4px;
  padding: 12px 24px;
  color: white;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  cursor: pointer;
  margin: 0 auto;
  width: 100%;
  max-width: 280px;
  text-align: center;
}

.google-wallet-button:hover {
  background: #155ab6;
  transform: translateY(-1px);
}
.google-wallet-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.google-wallet-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>