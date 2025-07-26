<template>
  <q-page class="flex flex-center">
    <div
      class="q-pa-md q-gutter-md column items-center"
      style="max-width: 500px"
    >
      <h2>Google Login</h2>

      <!-- Direct Google Login -->
      <div id="google-signin-button"></div>

      <!-- Results -->
      <div v-if="result" class="q-mt-md full-width">
        <q-card
          :class="
            result.success ? 'bg-positive text-white' : 'bg-negative text-white'
          "
          class="q-pa-md"
        >
          <div>
            <strong>{{ result.success ? "Success!" : "Error!" }}</strong>
          </div>
          <div class="q-mt-sm">{{ result.message }}</div>
          <div v-if="result.details" class="q-mt-sm text-caption">
            {{ result.details }}
          </div>
        </q-card>
      </div>

      <!-- User Info -->
      <div v-if="userInfo" class="q-mt-md text-center">
        <q-avatar size="56px" :src="userInfo.picture" />
        <div class="q-mt-sm">{{ userInfo.name }}</div>
        <div class="q-mt-xs text-caption">{{ userInfo.email }}</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { GoogleLogin } from 'vue3-google-login';
import { userStore } from 'src/stores/userStore.js';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
const backendApiUrl = process.env.VUE_APP_API_BASE_URL;
const currentOrigin = ref('');
const result = ref(null);
const userInfo = ref(null);
const loading = ref(false);

onMounted(async () => {
  currentOrigin.value = window.location.origin;

  console.log('=== GOOGLE LOGIN DEBUG ===');
  console.log('Origin:', currentOrigin.value);
  console.log('Client ID:', clientId);

  // Wait for DOM to be ready
  await nextTick();

  // Try to load Google Identity Services directly
  loadGoogleAPI();
});

function loadGoogleAPI() {
  // Check if Google API is already loaded
  if (window.google && window.google.accounts) {
    initializeDirectGoogleLogin();
    return;
  }

  // Load Google API script
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = () => {
    console.log('Google API loaded successfully');
    setTimeout(initializeDirectGoogleLogin, 500);
  };
  script.onerror = (error) => {
    console.error('Failed to load Google API:', error);
    result.value = {
      success: false,
      message: 'Failed to load Google API',
      details: 'Check if Google services are blocked by your network/firewall'
    };
  };
  document.head.appendChild(script);
}

function initializeDirectGoogleLogin() {
  try {
    if (!window.google || !window.google.accounts) {
      throw new Error('Google API not available');
    }

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleDirectGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false
    });

    // Render the button
    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'filled_blue',
        size: 'large',
        width: 240,
        text: 'signin_with'
      });

      console.log('Direct Google Sign-In button rendered');
    }

  } catch (error) {
    console.error('Error initializing direct Google Sign-In:', error);
    result.value = {
      success: false,
      message: 'Failed to initialize Google Sign-In',
      details: error.message
    };
  }
}

async function handleDirectGoogleResponse(response) {
  console.log('Direct Google login response:', response);
  loading.value = true;

  try {
    // First, decode the JWT to show user info immediately
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('Decoded Google payload:', payload);

    // Add this right after decoding the payload
    console.log('=== LOGIN DEBUG ===');
    console.log('Google Credential Token:', response.credential);
    console.log('Decoded Payload:', payload);
    console.log('User Google ID (should be unique):', payload.sub);
    console.log('User Email:', payload.email);
    console.log('===================');

    // Show immediate feedback
    userInfo.value = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      sub: payload.sub // Google user ID
    };

    result.value = {
      success: true,
      message: 'Authenticating with backend...',
      details: `Welcome ${payload.name}`
    };

    // Send credential to backend for authentication
    // IMPORTANT: Send the full credential token, let backend decode it
    const loginResponse = await axios.post(`${backendApiUrl}/auth/login`, {
      token: response.credential, // This is correct - backend should decode this
      // Optionally send decoded data for debugging
      user_info: {
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    }, {
      headers: {'Content-Type': 'application/json'},
      withCredentials: true
    });

    console.log('Backend login response:', loginResponse.data);
    console.log('Google user ID (sub):', payload.sub); // This should be unique per user

    // Extract JWT and user data from backend response
    const { token, user } = loginResponse.data;

    if (!token || !user) {
      throw new Error('Invalid response from backend: missing jwt or user data');
    }

    // Store session token in localStorage for secureAxios
    localStorage.setItem('sessionToken', token);

    // Update user store with backend user data
    userStore.setUser(user);

    result.value = {
      success: true,
      message: 'Login successful!',
      details: `Welcome ${user.name || payload.name} (ID: ${payload.sub})`
    };

    // Redirect to app after successful login
    setTimeout(() => {
      router.push('/create-raseed');
    }, 1500);

  } catch (error) {
    console.error('Error during login process:', error);
    console.error('Error details:', error.response?.data);
    result.value = {
      success: false,
      message: 'Login failed',
      details: error.response?.data?.message || error.message
    };
    
    // Clear any partial data
    localStorage.removeItem('sessionToken');
    userStore.clearUser();
  } finally {
    loading.value = false;
  }
}

function onLoginSuccess(response) {
  console.log('Vue3 Google login success:', response);

  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    userInfo.value = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    result.value = {
      success: true,
      message: 'Vue3 Google login successful!',
      details: `Welcome ${payload.name}`
    };

    userStore.setUser(userInfo.value);

  } catch (error) {
    result.value = {
      success: false,
      message: 'Failed to process Vue3 Google response',
      details: error.message
    };
  }
}

function onLoginError(error) {
  console.error('Vue3 Google login error:', error);
  result.value = {
    success: false,
    message: 'Vue3 Google login failed',
    details: JSON.stringify(error)
  };
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}

code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

#google-signin-button {
  margin: 10px 0;
}
</style>