import { reactive } from 'vue'

export const userStore = reactive({
  user: null,
  sessionToken: null,
  isLoading: false,
  
  setUser(userData) {
    console.log('Setting user data:', userData)
    this.user = userData
    localStorage.setItem('googleUser', JSON.stringify(userData))
  },
  
  setSessionToken(token) {
    console.log('Setting session token')
    this.sessionToken = token
    localStorage.setItem('sessionToken', token)
  },
  
  clearUser() {
    console.log('Clearing user data')
    this.user = null
    this.sessionToken = null
    localStorage.removeItem('googleUser')
    localStorage.removeItem('sessionToken')
  },
  
  loadUser() {
    console.log('Loading user from localStorage')
    const userData = localStorage.getItem('googleUser')
    const sessionToken = localStorage.getItem('sessionToken')
    
    if (userData) {
      try {
        this.user = JSON.parse(userData)
        console.log('User loaded from localStorage:', this.user)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        localStorage.removeItem('googleUser')
      }
    }
    
    if (sessionToken) {
      this.sessionToken = sessionToken
      console.log('Session token loaded from localStorage')
    }
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.user && this.sessionToken)
  }
})