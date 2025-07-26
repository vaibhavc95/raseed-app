<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <!-- Logo -->
        <div class="logo-container">
          <q-icon name="receipt" color="primary" size="28px" />
          <span class="text-primary text-h5 logo-text">Raseed</span>
        </div>
        
        <q-space />
        
        <!-- Right side - User info -->
        <div class="header-buttons">
          <q-btn flat round v-if="userStore.user">
            <q-avatar size="32px">
              <img :src="userProfilePicture || 'https://cdn.quasar.dev/img/avatar.png'" />
            </q-avatar>
            
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 200px">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar>
                      <img :src="userProfilePicture || 'https://cdn.quasar.dev/img/avatar.png'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ userStore.user.name }}</q-item-label>
                    <q-item-label caption>{{ userStore.user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
    
    <!-- Bottom Navigation -->
    <q-footer bordered class="bg-white text-dark">
      <q-tabs
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="bottom-navigation"
        :model-value="currentRoute"
        @update:model-value="navigateTo"
      >
        <q-tab name="dashboard" icon="home" label="Dashboard">
          <q-tooltip>Dashboard</q-tooltip>
        </q-tab>
        
        <q-tab name="upload" icon="upload_file" label="Upload">
          <q-tooltip>Upload Receipts</q-tooltip>
        </q-tab>
        
        <q-tab name="assistant" icon="psychology_alt" label="Assistant">
          <q-tooltip>AI Assistant</q-tooltip>
        </q-tab>
      </q-tabs>
      
      <!-- Floating Action Button -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="add"
          color="secondary"
          size="md"
        />
      </q-page-sticky>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from 'src/stores/userStore'

const router = useRouter()
const route = useRoute()
// Fix for profile picture
const userProfilePicture = computed(() => {
  if (!userStore.user) return 'https://cdn.quasar.dev/img/avatar.png'
  
  // Check all possible locations of the profile picture
  return userStore.user.picture || 
         userStore.user.imageUrl || 
         userStore.user.image ||
         userStore.user.profilePicture ||
         userStore.user.avatar ||
         (userStore.user.profile && userStore.user.profile.picture) ||
         'https://cdn.quasar.dev/img/avatar.png'
})
// Determine current active tab based on current route
const currentRoute = computed(() => {
  if (route.path.includes('assistant')) return 'assistant'
  if (route.path.includes('upload')) return 'upload'
  return 'dashboard'
})

// Navigation handler
function navigateTo(tabName) {
  switch (tabName) {
    case 'dashboard':
      router.push('/create-raseed')
      break
    case 'upload':
      router.push('/create-raseed')
      break
    case 'assistant':
      router.push('/assistant')
      break
  }
}

// Logout function
function logout() {
  userStore.clearUser()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-weight: 600;
  color: #0F9D58;
  margin-top: 2px;
}

.header-buttons {
  display: flex;
  align-items: center;
}

.bottom-navigation {
  height: 64px;
  
  .q-tab {
    padding: 8px 4px;
    min-height: 64px;
    
    .q-tab__icon {
      font-size: 24px;
    }
    
    .q-tab__label {
      font-size: 12px;
      margin-top: 4px;
    }
  }
}

/* Fix for bottom navigation on mobile */
@media (max-width: 599px) {
  .q-page-container {
    padding-bottom: 70px;
  }
}
</style>
