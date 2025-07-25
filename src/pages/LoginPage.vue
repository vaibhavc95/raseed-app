<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md q-gutter-md column items-center" style="max-width: 500px;">
      <h2>Google Login</h2>



      <!-- Direct Google Login -->
      <div id="google-signin-button"></div>



      <!-- Results -->
      <div v-if="result" class="q-mt-md full-width">
        <q-card :class="result.success ? 'bg-positive text-white' : 'bg-negative text-white'" class="q-pa-md">
          <div><strong>{{ result.success ? 'Success!' : 'Error!' }}</strong></div>
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

const clientId = '397356884501-bt6d99vcg44jur49g5peeo4ep6gg5383.apps.googleusercontent.com';
const currentOrigin = ref('');
const result = ref(null);
const userInfo = ref(null);

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

function handleDirectGoogleResponse(response) {
  console.log('Direct Google login response:', response);

  try {
    // Decode JWT token
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('Decoded payload:', payload);

    userInfo.value = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    result.value = {
      success: true,
      message: 'Direct Google login successful!',
      details: `Welcome ${payload.name}`
    };

    // Update user store
    userStore.setUser(userInfo.value);

  } catch (error) {
    console.error('Error processing Google response:', error);
    result.value = {
      success: false,
      message: 'Failed to process Google response',
      details: error.message
    };
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
