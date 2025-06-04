<template>
  <div class="register-container">
    <h2 class="title">Регистрация</h2>

    <form v-if="!registered" @submit.prevent="handleSubmit" class="register-form" novalidate>
      <div class="form-group">
        <label>Имя пользователя</label>
        <input
            v-model.trim="form.username"
            type="text"
            :class="{ invalid: errors.username }"
            @blur="validateUsername"
            required
        />
        <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
      </div>

      <div class="form-group">
        <label>Эл. почта</label>
        <input
            v-model.trim="form.email"
            type="email"
            :class="{ invalid: errors.email }"
            @blur="validateEmail"
            required
        />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <div class="form-group">
        <label>Пароль</label>
        <input
            v-model="form.password"
            type="password"
            :class="{ invalid: errors.password }"
            @blur="validatePassword"
            required
        />
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
      </div>

      <div class="form-group">
        <label>Подтверждение пароля</label>
        <input
            v-model="form.confirmPassword"
            type="password"
            :class="{ invalid: errors.confirmPassword }"
            @blur="validateConfirmPassword"
            required
        />
        <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading || hasErrors">
        {{ loading ? "Отправка..." : "Зарегистрироваться" }}
      </button>

      <p class="message error" v-if="message && !registered">{{ message }}</p>
    </form>

    <!-- Сообщение после успешной регистрации -->
    <div v-else class="confirmation-message">
      <p>Письмо с подтверждением отправлено на ваш email:</p>
      <p><strong>{{ form.email }}</strong></p>
      <p>Пожалуйста, перейдите по ссылке в письме, чтобы активировать аккаунт.</p>

      <p>Откройте вашу почту на одном из популярных сервисов:</p>
      <div class="mail-links">
        <a href="https://mail.google.com" target="_blank" rel="noopener">Gmail</a>
        <a href="https://outlook.live.com/mail/" target="_blank" rel="noopener">Outlook</a>
        <a href="https://mail.yahoo.com" target="_blank" rel="noopener">Yahoo Mail</a>
        <a href="https://mail.ru" target="_blank" rel="noopener">Mail.ru</a>
      </div>

      <button class="submit-btn" @click="goToLogin">Перейти к входу</button>
    </div>

    <p>
      Уже есть аккаунт?
      <button @click="goToLogin" class="link-btn">Войти</button>
    </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "RegisterForm",
  data() {
    return {
      form: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      errors: {
        username: null,
        email: null,
        password: null,
        confirmPassword: null,
      },
      loading: false,
      message: "",
      registered: false,
    };
  },
  computed: {
    hasErrors() {
      return (
          this.errors.username ||
          this.errors.email ||
          this.errors.password ||
          this.errors.confirmPassword
      );
    },
  },
  methods: {
    validateUsername() {
      const len = this.form.username.length;
      if (!this.form.username) {
        this.errors.username = "Имя пользователя обязательно";
      } else if (len < 2 || len > 20) {
        this.errors.username = "Имя должно содержать от 2 до 20 символов";
      } else {
        this.errors.username = null;
      }
    },
    validateEmail() {
      const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      if (!this.form.email) {
        this.errors.email = "Email обязателен";
      } else if (!re.test(this.form.email)) {
        this.errors.email = "Введите корректный email";
      } else {
        this.errors.email = null;
      }
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = "Пароль обязателен";
      } else if (this.form.password.length < 8) {
        this.errors.password = "Пароль должен содержать минимум 8 символов";
      } else {
        this.errors.password = null;
      }
    },
    validateConfirmPassword() {
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = "Подтверждение пароля обязательно";
      } else if (this.form.confirmPassword !== this.form.password) {
        this.errors.confirmPassword = "Пароли не совпадают";
      } else {
        this.errors.confirmPassword = null;
      }
    },
    async handleSubmit() {
      // Запускаем все валидации
      this.validateUsername();
      this.validateEmail();
      this.validatePassword();
      this.validateConfirmPassword();

      if (this.hasErrors) {
        return;
      }

      this.message = "";
      this.loading = true;

      try {
        const { username, email, password } = this.form;
        await axios.post("http://localhost:8080/api/user/registration", {
          username,
          email,
          password,
        });
        this.registered = true;
        this.message = "";
      } catch (error) {
        console.error("Ошибка регистрации:", error.response);
        if (error.response && error.response.data && error.response.data.message) {
          this.message = error.response.data.message;
        } else {
          this.message = "Ошибка регистрации. Проверьте данные.";
        }
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push("/log");
    },
  },
};
</script>

<style scoped>
.confirmation-message {
  text-align: center;
  color: #ccc;
  font-size: 1rem;
  margin-top: 1rem;
}

.mail-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0 2rem;
}

.mail-links a {
  color: #42b983;
  text-decoration: none;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border: 1px solid #42b983;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.mail-links a:hover {
  background-color: #42b983;
  color: #181818;
}

.message.error {
  color: #e74c3c;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.register-container {
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

.register-form {
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

input.invalid {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.5);
}

.error-message {
  margin-top: 0.25rem;
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: 600;
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
</style>
