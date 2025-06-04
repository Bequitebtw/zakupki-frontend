<template>
  <div class="page-container">
    <header class="tabs-header">
      <div class="tabs-buttons">
        <button class="back-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Назад
        </button>
      </div>
      <h2 class="page-title">Активные заказы</h2>
    </header>

    <main class="orders-content">
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="orders.length === 0" class="no-orders">
        Время сделать заказ :)
      </div>
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">Заказ #{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
            </div>
            <div class="order-total">Итого: {{ order.totalPrice }} ₽</div>
          </div>

          <div class="order-items">
            <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
                @click="openProduct(item.product.id)"
                style="cursor: pointer;"
            >
              <div class="item-image-wrapper">
                <img
                    v-if="item.product.image"
                    :src="`data:${item.product.image.contentType};base64,${item.product.image.imageData}`"
                    alt="product"
                    class="item-image"
                />
                <div v-else class="no-image">No image</div>
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.product.name }}</h3>
                <div class="item-price">{{ item.pricePerItem }} ₽ × {{ item.quantity }}</div>
              </div>
              <div class="item-subtotal">{{ item.pricePerItem * item.quantity }} ₽</div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="alertMessage" :class="['alert', { 'alert-error': alertIsError }]">{{ alertMessage }}</div>
      </transition>

      <!-- Модальное окно -->
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <ProductDetailsTrash
              :productId="selectedProductId"
              @close="closeModal"
          />
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductDetailsTrash from '@/components/ProductDetailsTrash.vue'

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const alertMessage = ref('')
const alertIsError = ref(false)

const selectedProductId = ref(null)
const showModal = ref(false)

const openProduct = (id) => {
  selectedProductId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProductId.value = null
}

const fetchActiveOrders = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/orders/active', {
      withCredentials: true
    })
    orders.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке заказов:', error)
    alertShow('Не удалось загрузить активные заказы', true)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}

const getStatusText = (status) => {
  const statusMap = {
    'ACTIVE': 'В обработке',
    'READY': 'Готов к выдаче',
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return {
    'status-active': status === 'ACTIVE',
    'status-ready': status === 'READY',
  }
}

const goBack = () => {
  router.push('/')
}

const alertShow = (text, isError = false) => {
  alertMessage.value = text
  alertIsError.value = isError
  setTimeout(() => {
    alertMessage.value = ''
    alertIsError.value = false
  }, 2500)
}

onMounted(() => {
  fetchActiveOrders()
})
</script>

<style scoped>
.page-container {
  width: 100%;
  background-color: #121212;
  color: #ccc;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #181818;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid #2a2a2a;
  position: relative;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #eee;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.back-btn {
  background-color: #3b82f6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #2563eb;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.orders-content {
  padding: 1rem;
  flex-grow: 1;
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  color: #aaa;
  font-size: 1.2rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.order-card {
  background: linear-gradient(145deg, #2a2a2a, #252525);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.25);
  border: 1px solid rgba(66, 185, 131, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
}

.order-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.order-id {
  font-weight: bold;
  color: #eee;
}

.order-date {
  color: #aaa;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: bold;
}

.status-active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-ready {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.order-total {
  font-weight: bold;
  font-size: 1.1rem;
  color: #10b981;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.item-image-wrapper {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #666;
  font-size: 0.8rem;
}

.item-details {
  flex-grow: 1;
}

.item-name {
  margin: 0;
  font-size: 1rem;
  color: #eee;
}

.item-price {
  font-size: 0.9rem;
  color: #aaa;
}

.item-subtotal {
  font-weight: bold;
  color: #eee;
}

.alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
  font-weight: bold;
  z-index: 9999;
}

.alert-error {
  background-color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-info {
    gap: 0.5rem;
  }

  .page-title {
    position: static;
    transform: none;
    text-align: center;
    margin-top: 0.5rem;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 1rem;
  overflow: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
