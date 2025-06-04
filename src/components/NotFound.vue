<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <h1>404 — Страница не найдена</h1>
      <p>Кажется, вы попали не туда. Такой страницы не существует или у вас нет к ней доступа.</p>
      <button @click="goHome" class="back-button">Вернуться на сайт</button>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/welcome')
}
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  width: 100%;
  background-color: #121212;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-family: Arial, sans-serif;
}

.not-found-card {
  background-color: #1f1f1f;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
  max-width: 500px;
  text-align: center;
  animation: fade-in 0.5s ease-out;
}

.not-found-card h1 {
  font-size: 2rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.not-found-card p {
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #aaa;
}

.back-button {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background-color: #2563eb;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>