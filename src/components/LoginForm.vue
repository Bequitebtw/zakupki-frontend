<template>
  <div class="login-container">
    <h2 class="title">Вход</h2>

    <p v-if="confirmMessage" class="confirm-message">{{ confirmMessage }}</p>

    <form @submit.prevent="handleLogin" class="login-form" v-if="!confirmLoading">
      <div class="form-group">
        <label>Ваш email</label>
        <input v-model="form.username" type="email" required/>
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input v-model="form.password" type="password" required/>
      </div>
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? "Вход..." : "Войти" }}
      </button>
      <p class="message" v-if="message">{{ message }}</p>
    </form>

    <p v-if="confirmLoading" class="loading-message">Подтверждаем аккаунт...</p>

    <p>
      Нет аккаунта?
      <button @click="goToRegister" class="link-btn">Зарегистрироваться</button>
    </p>
  </div>
</template>

<script>
import qs from 'qs';
import axios from 'axios';

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      message: '',
      confirmMessage: '',
      confirmLoading: false
    };
  },
  async created() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      this.confirmLoading = true;
      try {
        await axios.get(`http://localhost:8080/api/user/confirm?token=${encodeURIComponent(token)}`);
        this.confirmMessage = 'Аккаунт успешно подтверждён! Теперь можно войти.';
        history.replaceState(null, '', window.location.pathname);
      } catch (error) {
        this.confirmMessage = 'Ошибка подтверждения аккаунта.';
        console.error('Ошибка подтверждения:', error);
      } finally {
        this.confirmLoading = false;
      }
    }
  },
  methods: {
    async handleLogin() {
      this.message = '';
      this.loading = true;

      try {
        const response = await axios.post(
            'http://localhost:8080/login',
            qs.stringify({
              username: this.form.username,
              password: this.form.password
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              withCredentials: true
            }
        );
        if (response.status >= 200 && response.status < 300) {
          localStorage.setItem('auth', 'true');
          this.$router.push('/welcome');
        }
      } catch (error) {
        console.error("Ошибка входа:", error);
        if (error.response && error.response.status === 401) {
          this.message = 'Неверное имя пользователя или пароль.';
        } else if (error.response && error.response.status === 403) {
          this.message = 'Аккаунт не подтверждён.';
        } else {
          this.message = 'Ошибка подключения к серверу.';
        }
      } finally {
        this.loading = false;
      }
    },
    goToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.login-container {
  max-width: 400px;
  width: 100%;
  margin: 50px auto;
  padding: 2rem;
  background: #181818;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
  animation: slide-in 0.6s ease-out;
  color: #ccc;
  font-family: Arial, sans-serif;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #a0a0a0;
  font-weight: 700;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.2rem;
  width: 100%;
}

label {
  margin-bottom: 0.4rem;
  font-weight: bold;
  color: #ccc;
  display: block;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #222;
  color: #eee;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #666;
}

input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.3);
  outline: none;
}

.submit-btn {
  background: #42b983;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #369e72;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  text-align: center;
  margin-top: 1rem;
  font-weight: bold;
  color: #e74c3c;
}

.link-btn {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-weight: 600;
  margin-left: 0.5rem;
  padding: 0;
  font-size: 1rem;
}

.link-btn:hover {
  text-decoration: underline;
}

.confirm-message {
  text-align: center;
  margin-bottom: 1rem;
  color: #4caf50;
  font-weight: 600;
}

.loading-message {
  text-align: center;
  color: #ccc;
  font-style: italic;
  margin-bottom: 1rem;
}
</style>
