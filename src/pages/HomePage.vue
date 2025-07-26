<template>
  <q-page class="homepage-container">
    <!-- Background waves -->
    <div class="background-waves">
      <div class="wave wave-yellow"></div>
      <div class="wave wave-blue"></div>
    </div>

    <!-- Main hero content -->
    <div class="hero-content">
      <!-- Google Cloud style branding -->
      <div class="branding-section">
        <div class="google-cloud-logo">
          <span class="google-text">THE RADIX</span>
          <span class="cloud-text">SQUAD</span>
        </div>
        <div class="presents-text">PRESENTS</div>
      </div>

      <!-- Main title matching screenshot -->
      <div class="main-title">
        <h1 class="agentic-text"><span class="google-text">RASEED</span> AI</h1>
      </div>

      <!-- Subtitle -->
      <div class="subtitle">
        Build the next generation of intelligent receipt management
      </div>

      <!-- Powered by section -->
      <div class="partner-section">
        <div class="powered-by">
          <span>Powered by</span>
          <div class="h2s-logo">Gemini</div>
        </div>
      </div>

      <!-- Action buttons with Google Sign-in -->
      <div class="action-buttons">
        <!-- Google Sign-in button (when not logged in) -->
        <div v-if="!userStore.user" class="google-signin-container">
          <div id="google-signin-button" class="google-signin-btn"></div>
        </div>

        <!-- Welcome message when logged in -->
        <div v-else class="welcome-section">
          <div class="welcome-message">
            <q-avatar size="48px" class="q-mr-md">
              <img :src="userProfilePicture || 'https://cdn.quasar.dev/img/avatar.png'" />
            </q-avatar>
            <div>
              <div class="welcome-text">Welcome back, {{ userStore.user.name }}!</div>
              <div class="welcome-subtitle">Ready to manage your receipts?</div>
            </div>
          </div>
          
          <div class="logged-in-actions">
            <q-btn
              class="get-started-btn"
              rounded
              unelevated
              color="positive"
              size="lg"
              icon="receipt_long"
              label="Start Managing Receipts"
              @click="navigateToApp"
            />
            
            <q-btn
              class="assistant-btn"
              rounded
              unelevated
              color="primary"
              size="lg"
              icon="psychology"
              label="Ask AI Assistant"
              @click="navigateToAssistant"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading/Result overlay for Google Sign-in -->
    <!-- <div v-if="result" class="result-overlay">
      <q-card
        :class="result.success ? 'bg-positive text-white' : 'bg-negative text-white'"
        class="result-card"
      >
        <q-card-section>
          <div class="text-h6">{{ result.success ? "Success!" : "Error!" }}</div>
          <div class="q-mt-sm">{{ result.message }}</div>
          <div v-if="result.details" class="q-mt-sm text-caption">
            {{ result.details }}
          </div>
        </q-card-section>
      </q-card>
    </div> -->
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from 'src/stores/userStore'
import axios from 'axios'

const router = useRouter()

// Google Sign-in state
const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID
const backendApiUrl = process.env.VUE_APP_API_BASE_URL
const result = ref(null)
const loading = ref(false)

// User profile picture computed
const userProfilePicture = computed(() => {
  if (!userStore.user) return 'https://cdn.quasar.dev/img/avatar.png'
  
  return userStore.user.picture || 
         userStore.user.imageUrl || 
         userStore.user.image ||
         userStore.user.profilePicture ||
         userStore.user.avatar ||
         (userStore.user.profile && userStore.user.profile.picture) ||
         'https://cdn.quasar.dev/img/avatar.png'
})

// Navigation functions
function navigateToApp() {
  router.push('/create-raseed')
}

function navigateToAssistant() {
  router.push('/assistant')
}

// Google Sign-in implementation (from LoginPage.vue)
onMounted(async () => {
  // Only load Google API if user is not logged in
  if (!userStore.user) {
    await nextTick()
    loadGoogleAPI()
  }
})

function loadGoogleAPI() {
  // Check if Google API is already loaded
  if (window.google && window.google.accounts) {
    initializeDirectGoogleLogin()
    return
  }

  // Load Google API script
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.onload = () => {
    console.log('Google API loaded successfully')
    setTimeout(initializeDirectGoogleLogin, 500)
  }
  script.onerror = (error) => {
    console.error('Failed to load Google API:', error)
    result.value = {
      success: false,
      message: 'Failed to load Google API',
      details: 'Check if Google services are blocked by your network/firewall'
    }
  }
  document.head.appendChild(script)
}

function initializeDirectGoogleLogin() {
  try {
    if (!window.google || !window.google.accounts) {
      throw new Error('Google API not available')
    }

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleDirectGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false
    })

    // Render the button
    const buttonDiv = document.getElementById('google-signin-button')
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'filled_blue',
        size: 'large',
        width: 280,
        text: 'signin_with',
        shape: 'pill'
      })
      console.log('Google Sign-In button rendered')
    }

  } catch (error) {
    console.error('Error initializing Google Sign-In:', error)
    result.value = {
      success: false,
      message: 'Failed to initialize Google Sign-In',
      details: error.message
    }
  }
}

async function handleDirectGoogleResponse(response) {
  console.log('Google login response:', response)
  loading.value = true

  try {
    // Decode the JWT to show user info immediately
    const payload = JSON.parse(atob(response.credential.split('.')[1]))
    console.log('Decoded Google payload:', payload)

    result.value = {
      success: true,
      message: 'Authenticating with backend...',
      details: `Welcome ${payload.name}`
    }

    // Send credential to backend for authentication
    const loginResponse = await axios.post(`${backendApiUrl}/auth/login`, {
      token: response.credential,
      user_info: {
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    }, {
      headers: {'Content-Type': 'application/json'},
      withCredentials: true
    })

    console.log('Backend login response:', loginResponse.data)

    // Extract JWT and user data from backend response
    const { token, user } = loginResponse.data

    if (!token || !user) {
      throw new Error('Invalid response from backend: missing jwt or user data')
    }

    // Store session token in localStorage
    localStorage.setItem('sessionToken', token)

    // Update user store with backend user data
    userStore.setUser(user)

    result.value = {
      success: true,
      message: 'Login successful!',
      details: `Welcome to Raseed, ${user.name || payload.name}!`
    }

    // Redirect to /create-raseed after successful login
    setTimeout(() => {
      result.value = null
      router.push('/create-raseed')
    }, 1500)

  } catch (error) {
    console.error('Error during login process:', error)
    result.value = {
      success: false,
      message: 'Login failed',
      details: error.response?.data?.message || error.message
    }
    
    // Clear any partial data
    localStorage.removeItem('sessionToken')
    userStore.clearUser()
    
    // Clear error after 5 seconds
    setTimeout(() => {
      result.value = null
    }, 5000)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.homepage-container {
  position: relative;
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Background waves */
.background-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.wave {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.wave-yellow {
  top: -5%;
  left: -5%;
  width: 45%;
  height: 70%;
  background-image: url('../assets/home-page/yellow_wave.svg');
  transform: scale(0.8);
}

.wave-blue {
  bottom: -5%;
  right: -5%;
  width: 45%;
  height: 80%;
  background-image: url('../assets/home-page/blue_wave.svg');
  transform: scale(0.8);
}

/* Main content */
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Branding section */
.branding-section {
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.google-cloud-logo {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-text {
  color: #4285f4;
  font-family: 'Product Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.cloud-text {
  color: #5f6368;
  margin-left: 0.5rem;
  font-family: 'Product Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.presents-text {
  font-size: 1rem;
  font-weight: 500;
  color: #5f6368;
  letter-spacing: 2px;
  text-align: center;
}

/* Main title */
.main-title {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.agentic-text,
.ai-day-text {
  font-size: 6rem;
  font-weight: 700;
  line-height: 0.85;
  margin: 0;
  color: #202124;
  text-align: center;
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.ai-day-text {
  margin-top: -0.5rem;
}

/* Subtitle */
.subtitle {
  font-size: 1.6rem;
  color: #5f6368;
  margin-bottom: 3rem;
  font-weight: 400;
  text-align: center;
  max-width: 600px;
  line-height: 1.4;
}

/* Partner section */
.partner-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.powered-by,
.premium-partner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #5f6368;
}

.h2s-logo {
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.partner-icon {
  display: flex;
  align-items: center;
}

/* Action buttons section */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
}

/* Google Sign-in styling */
.google-signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.google-signin-btn {
  border-radius: 24px !important;
  box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3) !important;
  transition: all 0.3s ease !important;
}

/* Welcome section for logged-in users */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  width: 100%;
}

.welcome-message {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8eaed;
}

.welcome-text {
  font-size: 1.4rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 0.25rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #5f6368;
}

.logged-in-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.get-started-btn,
.assistant-btn {
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

.get-started-btn {
  background: linear-gradient(135deg, #34a853 0%, #4caf50 100%) !important;
}

.assistant-btn {
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%) !important;
}

.get-started-btn:hover,
.assistant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Deadline section */
.deadline-section {
  display: flex;
  justify-content: center;
}

.deadline-btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid #1a73e8;
  color: #1a73e8;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.deadline-btn:hover {
  background-color: #1a73e8;
  color: white;
  transform: translateY(-1px);
}

/* Result overlay */
.result-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  max-width: 400px;
  width: 90%;
}

.result-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  .homepage-container {
    padding: 1.5rem 1rem;
  }

  .agentic-text,
  .ai-day-text {
    font-size: 4rem;
  }

  .google-cloud-logo {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.3rem;
    margin-bottom: 2.5rem;
  }

  .partner-section {
    gap: 2rem;
    flex-direction: column;
  }

  .welcome-message {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .wave-yellow {
    width: 60%;
    height: 50%;
    transform: scale(0.7);
  }

  .wave-blue {
    width: 70%;
    height: 60%;
    transform: scale(0.7);
  }
}

@media (max-width: 480px) {
  .homepage-container {
    padding: 1rem 0.5rem;
  }

  .agentic-text,
  .ai-day-text {
    font-size: 3rem;
  }

  .google-cloud-logo {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .welcome-message {
    padding: 1rem;
  }

  .welcome-text {
    font-size: 1.2rem;
  }

  .get-started-btn,
  .assistant-btn {
    font-size: 1rem;
    padding: 1rem 1.5rem;
  }

  .wave-yellow {
    width: 80%;
    height: 40%;
    transform: scale(0.6);
  }

  .wave-blue {
    width: 90%;
    height: 50%;
    transform: scale(0.6);
  }
}

@media (max-width: 360px) {
  .agentic-text,
  .ai-day-text {
    font-size: 2.5rem;
  }

  .google-cloud-logo {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}

/* Override Google button styles */
:deep(.google-signin-btn) {
  border-radius: 24px !important;
  box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3) !important;
}

:deep(.google-signin-btn:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4) !important;
}
</style>