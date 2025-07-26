import { reactive } from 'vue';

export const userStore = reactive({
  user: null,
  sessionToken: null,
  
  setUser(userData) {
    this.user = userData;
    localStorage.setItem('googleUser', JSON.stringify(userData));
  },
  
  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  },
  
  clearUser() {
    this.user = null;
    this.sessionToken = null;
    localStorage.removeItem('googleUser');
    localStorage.removeItem('sessionToken');
  },
  
  loadUser() {
    const userData = localStorage.getItem('googleUser');
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (userData) {
      this.user = JSON.parse(userData);
    }
    
    if (sessionToken) {
      this.sessionToken = sessionToken;
    }
  }
});