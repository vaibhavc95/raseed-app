<template>
  <q-page class="homepage-container">
    <!-- Background waves -->
    <div class="background-waves">
      <div class="wave wave-yellow"></div>
      <div class="wave wave-blue"></div>
    </div>

    <!-- Main content -->
    <div class="hero-content">
      <!-- Google Cloud branding -->
      <div class="branding-section">
        <div class="google-cloud-logo">
          <span class="google-text">Google</span>
          <span class="cloud-text">Cloud</span>
        </div>
        <div class="presents-text">PRESENTS</div>
      </div>

      <!-- Main title -->
      <div class="main-title">
        <h1 class="agentic-text">Agentic</h1>
        <h1 class="ai-day-text">AI Day</h1>
      </div>

      <!-- Subtitle -->
      <div class="subtitle">
        Build the next generation of intelligent agents
      </div>

      <!-- Powered by and Premium partner -->
      <div class="partner-section">
        <div class="powered-by">
          <span>Powered by</span>
          <div class="h2s-logo">H2S</div>
        </div>
        <div class="premium-partner">
          <span>Premium partner</span>
          <div class="partner-icon">
            <q-icon name="verified" color="green" size="24px" />
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <q-btn
          class="registration-btn"
          rounded
          unelevated
          color="primary"
          icon="block"
          label="Registration Closed"
          disable
        />
        <q-btn
          class="deadline-btn"
          rounded
          unelevated
          label="Registration Deadline: 10 July 2025"
          outline
        />
      </div>

      <!-- CTA to app -->
      <div class="app-cta">
        <q-btn
          class="get-started-btn"
          rounded
          unelevated
          color="positive"
          size="lg"
          label="Get Started with Raseed"
          @click="navigateToApp"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function navigateToApp() {
  router.push('/create-raseed')
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
  padding: 2rem;
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
  width: 55%;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.registration-btn {
  background: #1a73e8 !important;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
}

.deadline-btn {
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid #dadce0;
  color: #5f6368;
}

.deadline-btn:hover {
  border-color: #1a73e8;
  color: #1a73e8;
}

/* App CTA */
.app-cta {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.get-started-btn {
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  background: #34a853 !important;
  box-shadow: 0 4px 16px rgba(52, 168, 83, 0.3);
  transition: all 0.3s ease;
}

.get-started-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 168, 83, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .homepage-container {
    padding: 1.5rem;
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

  .action-buttons {
    flex-direction: column;
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
    padding: 1rem;
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

  .get-started-btn {
    font-size: 1rem;
    padding: 1rem 2rem;
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
</style>