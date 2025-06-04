<template>
  <div class="order-list-container">
    <div class="header-wrapper">
      <button class="back-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Назад
      </button>
      <h1 class="title">Активные заказы</h1>
      <div class="header-spacer"></div>
    </div>

    <div v-if="productList.length === 0" class="empty-text">
      Нет активных заказов.
    </div>

    <div v-else class="product-table-wrapper">
      <table class="product-table">
        <thead>
        <tr>
          <th>Товар</th>
          <th>Количество</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in productList" :key="item.product.id" @click="openProductModal(item.product)">
          <td class="product-name">{{ item.product.name }}</td>
          <td>{{ item.totalQuantity }}</td>
        </tr>
        </tbody>
      </table>

      <div class="action-button-wrapper">
        <button class="mark-ready-btn" @click="markOrdersReady">
          Товары доставлены
        </button>
      </div>
    </div>

    <product-details-modal
        v-if="showProductModal"
        :product-id="selectedProductId"
        @close="closeProductModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductDetailsModal from './ProductDetailsTrash.vue'

const router = useRouter()
const productList = ref([])
const alertMessage = ref('')
const alertType = ref('')
const showProductModal = ref(false)
const selectedProductId = ref(null)

function goBack() {
  router.go(-1)
}


async function fetchProductList() {
  try {
    const res = await axios.get('/api/admin/orders', { withCredentials: true })
    productList.value = res.data // Массив из ProductQuantityDto
  } catch (e) {
    console.error('Ошибка при загрузке списка товаров', e)
    showAlert('Не удалось загрузить товары', 'error')
  }
}


async function markOrdersReady() {
  try {
    await axios.put('/api/admin/orders-ready', null, { withCredentials: true })
    productList.value = []
    showAlert('Статусы заказов обновлены, список очищен', 'success')
  } catch (e) {
    console.error('Ошибка при подтверждении наличия товаров', e)
    showAlert('Ошибка при обновлении заказов', 'error')
  }
}


function openProductModal(product) {
  selectedProductId.value = product.id
  showProductModal.value = true
}


function closeProductModal() {
  showProductModal.value = false
}


function showAlert(message, type = 'success') {
  alertMessage.value = message
  alertType.value = type
  setTimeout(() => {
    alertMessage.value = ''
    alertType.value = ''
  }, 3500)
}


onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>

.order-list-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 2rem;
  background-color: #181818;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
  color: #ccc;
  font-family: Arial, sans-serif;
  animation: fade-in 0.6s ease-out;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-spacer {
  width: 24px;
}

.back-btn {
  background-color: #3b82f6;
  border: none;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background-color: #2563eb;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #a0a0a0;
  margin: 0;
  text-align: center;
  flex-grow: 1;
}

.empty-text {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: #888;
}

.product-table-wrapper {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #1f1f1f;
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.95rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

th, td {
  padding: 14px 12px;
  border-bottom: 1px solid #444;
  text-align: left;
}

th {
  background-color: #2d2d2d;
  color: #bbb;
}

tr:hover {
  background-color: #3a3a3a;
  cursor: pointer;
}

.product-name {
  font-weight: bold;
}

.action-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.mark-ready-btn {
  background-color: #10b981;
  color: white;
  padding: 12px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mark-ready-btn:hover {
  background-color: #16a34a;
}


.custom-alert {
  padding: 12px;
  border-radius: 8px;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  max-width: 400px;
  width: 100%;
  color: #fff;
  text-align: center;
}

.custom-alert.success {
  background-color: #4caf50;
}

.custom-alert.error {
  background-color: #f44336;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
