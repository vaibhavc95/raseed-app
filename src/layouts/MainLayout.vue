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
          <q-btn flat icon="psychology" color="grey-7" class="ai-powered-btn">
            <span class="ai-powered-text">AI Powered</span>
          </q-btn>
          
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
    <q-page-container :class="{ 'with-bottom-nav': userStore.user }">
      <router-view />
    </q-page-container>
    
    <!-- Bottom Navigation - Only show when user is logged in -->
    <q-footer v-if="userStore.user" class="mobile-bottom-nav">
      <div class="nav-container">
        <div class="nav-items">
          <!-- Insights Tab -->
          <div 
            class="nav-item" 
            :class="{ active: currentRoute === 'insights' }"
            @click="navigateTo('insights')"
          >
            <div class="nav-icon">
              <q-icon name="insights" size="24px" />
            </div>
            <div class="nav-label">Insights</div>
          </div>
          
          <!-- Upload Receipts Tab -->
          <div 
            class="nav-item" 
            :class="{ active: currentRoute === 'upload' }"
            @click="navigateTo('upload')"
          >
            <div class="nav-icon">
              <q-icon name="cloud_upload" size="24px" />
            </div>
            <div class="nav-label">Upload receipts</div>
          </div>
          
          <!-- Assistant Tab with Brain Icon -->
          <div 
            class="nav-item" 
            :class="{ active: currentRoute === 'assistant' }"
            @click="navigateTo('assistant')"
          >
            <div class="nav-icon">
              <q-icon name="psychology" size="24px" />
            </div>
            <div class="nav-label">Assistant</div>
          </div>
        </div>
        
        <!-- Floating Action Button -->
        <!-- <div class="fab-container">
          <q-btn
            fab
            icon="add"
            color="positive"
            size="56px"
            class="main-fab"
            @click="navigateTo('upload')"
          />
        </div> -->
      </div>
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
  if (route.path.includes('create-raseed') || route.path.includes('upload')) return 'upload'
  return 'insights'
})

// Navigation handler
function navigateTo(tabName) {
  switch (tabName) {
    case 'insights':
      router.push('/create-raseed') // You can change this to a dedicated insights page
      break
    case 'upload':
      router.push('/create-raseed')
      break
    case 'assistant':
      router.push('/assistant')
      break
  }
}

// Fixed logout function - redirect to HomePage
function logout() {
  userStore.clearUser()
  router.push('/') // Changed from '/login' to '/'
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
  gap: 8px;
  
  .google-wallet-btn, .ai-powered-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    
    .google-wallet-text, .ai-powered-text {
      font-weight: 500;
      color: #5f6368;
    }
  }
}

/* Mobile-First Bottom Navigation */
.mobile-bottom-nav {
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: 80px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  position: relative;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.nav-items {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  height: 100%;
  align-items: center;
  padding: 0 20px;
  gap: 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 64px;
  position: relative;
  
  &:hover {
    background-color: rgba(26, 115, 232, 0.04);
  }
  
  &.active {
    .nav-icon {
      color: #1a73e8;
      transform: scale(1.1);
    }
    
    .nav-label {
      color: #1a73e8;
      font-weight: 600;
    }
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  color: #5f6368;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: #5f6368;
  text-align: center;
  line-height: 1.2;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.fab-container {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 1001;
}

.main-fab {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);  
  }
}

/* Page container with conditional padding */
.q-page-container {
  padding-bottom: 0; // Default no padding when logged out
  
  &.with-bottom-nav {
    padding-bottom: 80px; // Add padding when bottom nav is visible
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .header-buttons {
    .google-wallet-btn, .ai-powered-btn {
      .google-wallet-text, .ai-powered-text {
        display: none;
      }
    }
  }
  
  .nav-items {
    padding: 0 12px;
    gap: 4px;
  }
  
  .nav-label {
    font-size: 10px;
    max-width: 70px;
  }
  
  .fab-container {
    right: 12px;
  }
  
  .main-fab {
    width: 48px;
    height: 48px;
    
    .q-btn__content .q-icon {
      font-size: 20px;
    }
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .nav-items {
    padding: 0 16px;
  }
  
  .nav-label {
    font-size: 11px;
  }
}

@media (min-width: 769px) {
  .mobile-bottom-nav {
    height: 90px;
  }
  
  .nav-item {
    min-height: 70px;
    padding: 12px 8px;
  }
  
  .nav-label {
    font-size: 12px;
    max-width: 100px;
  }
  
  .main-fab {
    width: 60px;
    height: 60px;
  }
  
  .q-page-container.with-bottom-nav {
    padding-bottom: 90px;
  }
}

/* Hide on larger screens if you want a different layout for desktop */
@media (min-width: 1024px) {
  .mobile-bottom-nav {
    display: block; /* Keep it visible, but you can change to 'none' if desired */
  }
}
</style>
