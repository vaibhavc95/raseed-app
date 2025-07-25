import { reactive } from 'vue';

export const userStore = reactive({
  user: null,
  setUser(userData) {
    this.user = userData;
    localStorage.setItem('googleUser', JSON.stringify(userData));
  },
  clearUser() {
    this.user = null;
    localStorage.removeItem('googleUser');
  },
  loadUser() {
    const data = localStorage.getItem('googleUser');
    if (data) {
      this.user = JSON.parse(data);
    }
  }
});