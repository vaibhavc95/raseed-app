<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md q-gutter-md column items-center">
      <h2>Login with Google</h2>
      <GoogleLogin
        :clientId="clientId"
        :buttonConfig="{ width: '240px', theme: 'outline', size: 'large' }"
        @success="onLoginSuccess"
        @error="onLoginError"
      />
      <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>
      <div v-if="userStore.user" class="q-mt-md">
        <q-avatar size="56px" :src="userStore.user.picture" />
        <div class="q-mt-sm">{{ userStore.user.name }}</div>
        <div class="q-mt-xs text-caption">{{ userStore.user.email }}</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { GoogleLogin } from 'vue3-google-login';
import { userStore } from 'src/stores/userStore.js';
import axios from 'axios';

const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
console.log("Client id", clientId);
const devMode = process.env.VUE_APP_DEV_MODE === 'true';
const error = ref(null);

onMounted(() => {
  if (devMode && !userStore.user) {
    // Set a mock user and token in dev mode
    const mockUser = {
      name: 'Dev User',
      email: 'dev@example.com',
      picture: 'https://i.pravatar.cc/150?img=3'
    };
    userStore.setUser(mockUser);
    localStorage.setItem('sessionToken', 'dev-session-token');
  }
});

async function onLoginSuccess(response) {
  error.value = null;
  const googleCredential = response.credential;

  try {
    // Send the Google credential to your backend
    const backendResponse = await axios.post(
      process.env.VUE_APP_API_BASE_URL + '/auth/google',
      { credential: googleCredential }
    );

    // Assume backend returns { user, token }
    const { user, token } = backendResponse.data;

    // Save user info and backend token
    userStore.setUser(user);
    localStorage.setItem('sessionToken', token);
  } catch (err) {
    error.value = 'Login failed: ' + (err.response?.data?.message || err.message);
  }
}

function onLoginError(err) {
  console.log('Login error:', err);
  error.value = 'Google login failed. Please try again.';
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
