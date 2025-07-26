<template>
  <q-page class="assistant-bg">
    <div class="assistant-card">
      <!-- Header -->
      <div class="assistant-header">
        <div class="header-icon">
          <q-icon name="psychology_alt" color="positive" size="28px" />
        </div>
        <span class="assistant-title">AI Financial Assistant</span>
        <q-badge color="positive" class="gemini-badge" label="Powered by Gemini" />
      </div>

      <!-- Chat Messages -->
      <div class="messages-area" ref="messagesContainer">
        <!-- Initial Welcome Message (when no messages) -->
        <div v-if="messages.length === 0" class="welcome-message">
          <p class="welcome-text">
            Hi! I'm your AI financial assistant. Ask me anything about your spending, receipts, or financial insights. I can help in any language!
          </p>
        </div>

        <!-- Message history -->
        <div v-else v-for="(message, index) in messages" :key="index" class="message-item"
          :class="{ 'user-message': message.type === 'user', 'assistant-message': message.type === 'assistant' }">
          <div class="message-content">
            <!-- User messages stay as plain text -->
            <div v-if="message.type === 'user'" class="message-text">{{ message.text }}</div>
            
            <!-- Assistant messages can contain HTML -->
            <div v-else class="message-text" v-html="message.text"></div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Suggested Questions -->
      <div v-if="messages.length === 0" class="suggested-section">
        <div class="suggested-label">Suggested questions:</div>
        <div class="suggested-grid">
          <div class="suggested-row">
            <q-btn no-caps unelevated class="suggested-btn" @click="sendMessage('What can I cook from what I bought in the last 2 weeks?')">
              What can I cook from what I bought in the last 2 weeks?
            </q-btn>
            <q-btn no-caps unelevated class="suggested-btn" @click="sendMessage('How much did I spend on groceries last month?')">
              How much did I spend on groceries last month?
            </q-btn>
          </div>
          <div class="suggested-row">
            <q-btn no-caps unelevated class="suggested-btn" @click="sendMessage('Do I still have enough detergent for my laundry?')">
              Do I still have enough detergent for my laundry?
            </q-btn>
            <q-btn no-caps unelevated class="suggested-btn" @click="sendMessage('Am I spending more than usual?')">
              Am I spending more than usual?
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <q-input
          v-model="inputMessage"
          placeholder="Ask me anything about your spending..."
          outlined
          rounded
          bg-color="white"
          dense
          class="chat-input"
          @keyup.enter="sendMessage"
        >
          <template v-slot:before>
            <q-btn round flat dense icon="mic" color="grey-7" class="q-mr-xs" />
          </template>
          <template v-slot:after>
            <q-btn round flat dense icon="send" color="primary" class="send-btn" @click="sendMessage" />
          </template>
        </q-input>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import secureAxios from 'src/boot/secureAxios'

// Reactive state
const inputMessage = ref('')
const messages = ref([])
const isTyping = ref(false)
const sessionId = ref('')
const messagesContainer = ref(null)

// Initialize session on component mount
onMounted(() => {
  generateSessionId()
})

// Generate unique session ID for this chat
function generateSessionId() {
  sessionId.value = uuidv4()
}

// Send message (either from input or suggested questions)
async function sendMessage(suggestedMessage) {
  // Check if suggestedMessage is an event or a string
  const isEvent = suggestedMessage && typeof suggestedMessage === 'object' && suggestedMessage.constructor && suggestedMessage.constructor.name.includes('Event')
  
  // Get the actual message text
  const message = isEvent ? inputMessage.value.trim() : (suggestedMessage || inputMessage.value.trim())
  
  if (!message || isTyping.value) return
  
  // Clear input field if not from suggested questions
  if (!suggestedMessage || isEvent) {
    inputMessage.value = ''
  }

  // Add user message to chat
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  // Show typing indicator
  isTyping.value = true
  scrollToBottom()

  try {
    // Send request to API
    const response = await secureAxios.post('/multi-agent-run', {
      query: message, // Now correctly sending the message text
      session_id: sessionId.value
    })

    // Add response to messages - handle HTML content
    messages.value.push({
      type: 'assistant',
      text: sanitizeHtml(response.data?.result || 'I processed your request but have no specific insights to share.'),
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error querying assistant:', error)
    
    // Add error message
    messages.value.push({
      type: 'assistant',
      text: 'Sorry, I encountered an error processing your request. Please try again.',
      timestamp: new Date()
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

// Basic HTML sanitization function to help prevent XSS
function sanitizeHtml(html) {
  // If not a string, convert to string
  if (typeof html !== 'string') {
    return String(html || '');
  }
  
  // Already using v-html which has some Vue protections,
  // but here we can add additional sanitization if needed
  return html;
}

// Scroll to bottom of chat
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.assistant-bg {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
  padding-bottom: 80px; /* Space for bottom navigation */
}

.assistant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header styles */
.assistant-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-icon {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.assistant-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  flex-grow: 1;
}

.gemini-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  background-color: #e7f5ec !important;
  color: #0d652d !important;
}

/* Messages area */
.messages-area {
  flex-grow: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

.welcome-message {
  margin-bottom: 20px;
}

.welcome-text {
  font-size: 16px;
  line-height: 1.6;
  color: #5f6368;
}

.message-item {
  margin-bottom: 16px;
}

.message-content {
  max-width: 80%;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-message .message-content {
  text-align: right;
}

.message-text {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #f0f0f0;
  color: #202124;
  font-size: 15px;
  line-height: 1.5;
}

.user-message .message-text {
  background-color: #1a73e8;
  color: white;
}

/* Add styles for HTML content in messages */
.message-text :deep(p) {
  margin: 0 0 0.75em 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul), 
.message-text :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.message-text :deep(li) {
  margin-bottom: 0.25em;
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(a) {
  color: #1a73e8;
  text-decoration: none;
}

.message-text :deep(a:hover) {
  text-decoration: underline;
}

.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75em 0;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid #e0e0e0;
  padding: 8px;
  text-align: left;
}

.message-text :deep(th) {
  background-color: #f8f9fa;
}

/* Typing indicator */
.typing-indicator {
  padding: 12px 0;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background-color: #5f6368;
  border-radius: 50%;
  animation: typing-animation 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-animation {
  0%, 60%, 100% { transform: scale(0.6); opacity: 0.4; }
  30% { transform: scale(1); opacity: 1; }
}

/* Suggested questions section */
.suggested-section {
  padding: 0 24px 20px;
}

.suggested-label {
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 12px;
}

.suggested-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggested-row {
  display: flex;
  gap: 10px;
}

.suggested-btn {
  flex: 1;
  text-align: left;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #202124;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: normal;
  min-height: unset;
  height: auto;
  white-space: normal;
  line-height: 1.4;
}

.suggested-btn:hover {
  background-color: #f8f9fa;
}

/* Input area */
.input-area {
  padding: 12px 24px;
  border-top: 1px solid #f0f0f0;
}

.chat-input {
  width: 100%;
}

@media (max-width: 600px) {
  .assistant-bg {
    padding: 12px;
    padding-bottom: 70px;
  }
  
  .assistant-card {
    height: calc(100vh - 100px);
  }
  
  .suggested-row {
    flex-direction: column;
  }
}
</style>