<template>
  <div class="page-container">
    <header class="tabs-header">
      <div class="tabs-buttons">
        <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: currentTab === tab }]"
            @click="setTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
      <button v-if="profile.role === 'ROLE_ADMIN'" class="admin-btn" @click="goToAdmin">admin</button>
    </header>

    <main class="tab-content">
      <div v-if="currentTab === 'Корзина'" class="tab-pane">
        <h2>Корзина</h2>
        <div v-if="cart.length === 0">Корзина пуста</div>
        <div class="products-list cart-products-list">
          <div v-for="item in cart" :key="item.id" class="product-card" @click="openProduct(item.id)">
            <div class="product-image-wrapper">
              <img
                  v-if="item.image?.imageData && item.image?.contentType"
                  :src="`data:${item.image.contentType};base64,${item.image.imageData}`"
                  alt="image"
                  class="product-image"
              />
              <div v-else class="no-image">No image available</div>
            </div>
            <h3>{{ item.name }}</h3>
            <p>Цена: {{ item.price }} ₽</p>
            <div class="quantity-section">
              <button class="quantity-btn" @click.stop="decreaseQuantity(item.id)">-</button>
              <input
                  type="number"
                  v-model.number="item.quantity"
                  class="quantity-input"
                  min="1"
                  max="100"
                  @click.stop
                  @input="validateQuantity(item.id)"
              />
              <button class="quantity-btn" @click.stop="increaseQuantity(item.id)">+</button>
              <button class="remove-btn" @click.stop="removeFromCart(item.id)">×</button>
            </div>
          </div>
        </div>
        <div v-if="cart.length > 0" class="order-section">
          <div class="total-price">Итого: {{ totalPrice }} ₽</div>
          <button class="order-btn" @click="placeOrder">Заказать</button>
          <button class="clear-cart-btn" @click="clearCart">Очистить корзину</button>
        </div>
      </div>

      <div v-else-if="currentTab === 'Товары'" class="tab-pane">
        <h2>Товары</h2>
        <input v-model="search" placeholder="Поиск по названию..." class="search-bar"/>
        <div class="products-list products-tab-list">
          <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="openProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <img
                  v-if="product.image?.imageData && product.image?.contentType"
                  :src="`data:${product.image.contentType};base64,${product.image.imageData}`"
                  alt="image"
                  class="product-image"
              />
              <div v-else class="no-image">No image available</div>
            </div>
            <h3>{{ product.name }}</h3>
            <p>Цена: {{ product.price }} ₽</p>
            <div class="card-buttons">
              <div v-if="isInCart(product.id)" class="quantity-section">
                <button class="quantity-btn" @click.stop="decreaseQuantity(product.id)">-</button>
                <input
                    type="number"
                    v-model.number="getCartItem(product.id).quantity"
                    class="quantity-input"
                    min="1"
                    max="100"
                    @click.stop
                    @input="validateQuantity(product.id)"
                />
                <button class="quantity-btn" @click.stop="increaseQuantity(product.id)">+</button>
                <button class="remove-btn" @click.stop="removeFromCart(product.id)">×</button>
              </div>
              <button
                  v-else
                  class="cart-icon-btn"
                  @click.stop="addToCart(product)"
                  title="Добавить в корзину"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="cart-icon"
                >
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === 'Профиль'" class="tab-pane profile-tab">
        <h2>Профиль</h2>
        <div v-if="loading">Загрузка...</div>
        <div v-else class="profile-content">
          <div class="profile-details">
            <div class="profile-row">
              <label>Имя пользователя:</label>
              <div class="profile-input-wrapper">
                <input
                    v-model="profile.username"
                    class="profile-input"
                    :disabled="isGuest"
                    @blur="saveUsername"
                    @input="debounceSaveUsername"
                    placeholder="Введите имя пользователя"
                />
              </div>
            </div>
            <div class="profile-row">
              <label>Email:</label>
              <span>{{ profile.email }}</span>
            </div>
            <div class="profile-row">
              <label>Дата создания:</label>
              <span>{{ profile.created ? new Date(profile.created).toLocaleString() : '—' }}</span>
            </div>
            <div class="profile-row">
              <label>Адрес компании:</label>
              <span>Новофилёвский пр., 5А, корпус 1, Москва, Россия, 121087А</span>
            </div>
            <div class="profile-row">
              <label>Способ получения заказа:</label>
              <span>Доступен только самовывоз</span>
            </div>
            <p v-if="message" class="message">{{ message }}</p>
            <p v-if="error" class="error">{{ error }}</p>
            <div class="profile-logout-wrapper">
              <button
                  :class="[isGuest ? 'login-btn' : 'logout-btn']"
                  @click="isGuest ? goToLogin() : logout()"
              >
                {{ isGuest ? 'Войти' : 'Выйти' }}
              </button>
              <button
                  v-if="!isGuest"
                  class="order-history-btn"
                  @click="goToOrderHistory"
              >
                История заказов
              </button>
              <button
                  v-if="!isGuest"
                  class="active-orders-btn"
                  @click="goToActiveOrders"
              >
                Активные заказы
              </button>
            </div>
          </div>
          <div class="map-section">
            <label>Место самовывоза:</label>
            <div id="map" class="map-container"></div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="alertMessage" :class="['alert', { 'alert-error': alertIsError }]">{{ alertMessage }}</div>
      </transition>

      <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <ProductDetails
                :product-id="selectedProductId"
                :is-in-cart="isInCart(selectedProductId)"
                @add-to-cart="addToCart"
                @close="closeModal"
            />
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import ProductDetails from './ProductDetails.vue'
import { Map, View, Feature, Overlay } from 'ol'
import { Point } from 'ol/geom'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Style, Icon } from 'ol/style'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'

const router = useRouter()
const route = useRoute()
const tabs = ['Корзина', 'Товары', 'Профиль']
const currentTab = ref('Товары')
const profile = ref({ username: '', email: '', created: '', role: '' })
const isGuest = ref(true)
const loading = ref(true)
const message = ref('')
const error = ref('')
const products = ref([])
const search = ref('')
const cart = ref([])
const alertMessage = ref('')
const alertIsError = ref(false)
const saving = ref(false)
const showModal = ref(false)
const selectedProductId = ref(null)

const getTabStorageKey = () => `selectedTab_${route.path}`

const loadSavedTab = () => {
  const savedTab = localStorage.getItem(getTabStorageKey())
  if (savedTab && tabs.includes(savedTab)) {
    currentTab.value = savedTab
  } else {
    currentTab.value = 'Товары'
  }
}

const setTab = (tab) => {
  currentTab.value = tab
  localStorage.setItem(getTabStorageKey(), tab)
}


watch(() => route.path, () => {
  loadSavedTab()
})


const filteredProducts = computed(() => {
  return products.value.filter(p =>
      p.name?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
})


const isInCart = (productId) => {
  return cart.value.some(item => item.id === productId)
}


const getCartItem = (productId) => {
  return cart.value.find(item => item.id === productId)
}


const saveCartToLocalStorage = () => {
  const cartData = cart.value.map(item => ({
    id: item.id,
    quantity: item.quantity,
  }))
  localStorage.setItem('cart', JSON.stringify(cartData))
}


const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart')
  if (savedCart) {
    const cartData = JSON.parse(savedCart)
    cart.value = cartData
        .map(item => {
          const product = products.value.find(p => p.id === item.id)
          if (product) {
            return {
              ...product,
              quantity: item.quantity,
            }
          }
          return null
        })
        .filter(item => item !== null)
    saveCartToLocalStorage()
  }
}


const validateQuantity = (productId) => {
  const item = getCartItem(productId)
  if (item) {
    if (item.quantity < 1 || isNaN(item.quantity)) {
      item.quantity = 1
      alertShow(`Количество товара "${item.name}" установлено на 1`)
    } else if (item.quantity > 100) {
      item.quantity = 100
      alertShow(`Максимальное количество товара "${item.name}" — 100`)
    }
    saveCartToLocalStorage()
  }
}


let debounceTimeout = null
const debounceSaveUsername = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    saveUsername()
  }, 1000)
}


const saveUsername = async () => {
  if (isGuest.value || !profile.value.username.trim()) {
    if (!profile.value.username.trim()) {
      error.value = 'Имя пользователя не может быть пустым'
      message.value = ''
    }
    return
  }
  saving.value = true
  try {
    await axios.put('/api/user/profile', profile.value, { withCredentials: true })
    message.value = 'Имя пользователя сохранено'
    error.value = ''
    setTimeout(() => {
      message.value = ''
    }, 2500)
  } catch {
    error.value = 'Ошибка при сохранении имени пользователя'
    message.value = ''
  } finally {
    saving.value = false
  }
}

const logout = async () => {
  try {
    await axios.post('/logout', {}, { withCredentials: true })
    localStorage.removeItem('auth')
  } catch {
  }
  profile.value = { username: 'Гость', email: 'Неизвестно', created: '', role: '' }
  isGuest.value = true
  router.push('/log')
}

const goToLogin = async () => {
  await axios.post('/logout', {}, {withCredentials: true})
  localStorage.removeItem('auth')
  router.push('/log')
}

const goToAdmin = () => router.push('/admin')

const goToOrderHistory = () => router.push('/order-history')

const goToActiveOrders = () => router.push('/order-active')


const addToCart = (product) => {
  if (isGuest.value) {
    alertShow('Пожалуйста, войдите в систему, чтобы добавлять товары в корзину.', true)
    return
  }
  const found = cart.value.find(p => p.id === product.id)
  if (found) {
    if (found.quantity < 100) {
      found.quantity++
      alertShow(`Количество товара "${product.name}" увеличено`)
    } else {
      alertShow(`Максимальное количество товара "${product.name}" — 100`, true)
    }
  } else {
    cart.value.push({...product, quantity: 1})
    alertShow(`Добавлен товар "${product.name}" в корзину`)
  }
  saveCartToLocalStorage()
}


const increaseQuantity = (productId) => {
  const item = getCartItem(productId)
  if (item && item.quantity < 100) {
    item.quantity++
    alertShow(`Количество товара "${item.name}" увеличено`)
    saveCartToLocalStorage()
  } else if (item.quantity >= 100) {
    alertShow(`Максимальное количество товара "${item.name}" — 100`, true)
  }
}


const decreaseQuantity = (productId) => {
  const item = getCartItem(productId)
  if (item && item.quantity > 1) {
    item.quantity--
    alertShow(`Количество товара "${item.name}" уменьшено`)
    saveCartToLocalStorage()
  } else if (item && item.quantity === 1) {
    removeFromCart(productId)
  }
}


const removeFromCart = (productId) => {
  const item = getCartItem(productId)
  if (item) {
    cart.value = cart.value.filter(i => i.id !== productId)
    alertShow(`Товар "${item.name}" удален из корзины`)
    saveCartToLocalStorage()
  }
}

const clearCart = () => {
  if (cart.value.length === 0) {
    alertShow('Корзина уже пуста', true)
    return
  }
  cart.value = []
  alertShow('Корзина очищена')
  saveCartToLocalStorage()
}


const placeOrder = async () => {
  if (isGuest.value) {
    alertShow('Пожалуйста, войдите в систему, чтобы оформить заказ.', true)
    return
  }
  if (cart.value.length === 0) {
    alertShow('Корзина пуста, добавьте товары перед оформлением заказа.', true)
    return
  }

  try {
    const orderRequest = {
      items: cart.value.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pricePerItem: Number(item.price)
      })),
      totalPrice: Number(totalPrice.value)
    }

    const response = await axios.post('/api/orders', orderRequest, {
      withCredentials: true
    })

    if (response.status === 201) {
      alertShow('Заказ успешно оформлен!')
      cart.value = []
      saveCartToLocalStorage()
      const productsResponse = await axios.get('/api/product', {withCredentials: true})
      products.value = productsResponse.data
    } else {
      alertShow('Произошла ошибка при оформлении заказа', true)
    }
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error)
    if (error.response) {
      if (error.response.status === 400) {
        alertShow('Некорректные данные заказа', true)
      } else {
        alertShow('Ошибка сервера при оформлении заказа', true)
      }
    } else {
      alertShow('Не удалось подключиться к серверу', true)
    }
  }
}


const openProduct = (id) => {
  selectedProductId.value = id
  showModal.value = true
}


const closeModal = () => {
  showModal.value = false
  selectedProductId.value = null
}

const alertShow = (text, isError = false) => {
  alertMessage.value = text
  alertIsError.value = isError
  setTimeout(() => {
    alertMessage.value = ''
    alertIsError.value = false
  }, 2500)
}


let map = null
const initMap = () => {
  const coords = fromLonLat([37.5089931354492, 55.75496594037257])

  if (map) {
    map.setTarget(null)
  }

  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: coords,
      zoom: 13
    })
  })

  const marker = new Feature({
    geometry: new Point(coords)
  })
  marker.setStyle(new Style({
    image: new Icon({
      src: 'https://openlayers.org/en/latest/examples/data/icon.png',
      scale: 0.7
    })
  }))
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [marker]
    })
  })
  map.addLayer(vectorLayer)

  const popupElement = document.createElement('div')
  popupElement.innerHTML = '<div class="popup">Пункт самовывоза: Новофилёвский пр., 5А, корпус 1</div>'
  const popup = new Overlay({
    element: popupElement,
    position: coords,
    positioning: 'bottom-center',
    offset: [0, -20]
  })
  map.addOverlay(popup)

  setTimeout(() => {
    map.updateSize()
  }, 100)
}


onMounted(async () => {
  loadSavedTab()

  try {
    const res = await axios.get('/api/user/profile', {withCredentials: true})
    profile.value = res.data
    isGuest.value = false
  } catch {
    isGuest.value = true
    profile.value = {username: 'Гость', email: 'Неизвестно', created: '', role: ''}
  } finally {
    loading.value = false
  }

  try {
    const res = await axios.get('/api/product', {withCredentials: true})
    products.value = res.data
    loadCartFromLocalStorage()
  } catch (e) {
    console.error('Ошибка при загрузке продуктов', e)
  }

  // Инициализация карты при монтировании, если выбрана вкладка профиля
  if (currentTab.value === 'Профиль') {
    initMap()
  }
})

watch(currentTab, (newTab) => {
  if (newTab === 'Профиль') {
    setTimeout(() => initMap(), 100)
  }
})
</script>

<style scoped>

html, body {
  margin: 0;
  padding: 0;
  overflow-y: hidden;
  overflow-x: hidden;
}

.page-container {
  width: 100%;
  background-color: #121212;
  color: #ccc;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}

.quantity-input {
  width: 60px;
  padding: 0.3rem;
  border-radius: 6px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #eee;
  text-align: center;
}

.remove-btn {
  background-color: #e11d48;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  font-size: 1rem;
}

.remove-btn:hover {
  background-color: #be123c;
  transform: scale(1.05);
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

.cart-icon-btn {
  background-color: #10b981;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-icon-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.cart-icon {
  width: 24px;
  height: 24px;
  stroke: white;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: transparent;
  max-width: 750px;
  width: 95vw;
  max-height: 95vh;
  overflow-y: hidden;
  border-radius: 16px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 800px) {
  .modal-content {
    max-width: 90vw;
  }
}

@media (max-width: 600px) {
  .modal-content {
    max-width: 95vw;
    max-height: 90vh;
  }
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #181818;
  padding: 0 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid #2a2a2a;
  height: 48px;
  flex-shrink: 0;
}

.tabs-buttons {
  display: flex;
  flex-grow: 1;
  align-items: center;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  border-right: 1px solid #2a2a2a;
  line-height: 1;
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn:hover,
.tab-btn.active {
  background-color: #42b983;
  color: white;
}

.admin-btn {
  background-color: #3b82f6;
  border: none;
  padding: 0.6rem 1.2rem;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-left: 1rem;
  height: 36px;
  line-height: 1;
}

.admin-btn:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.tab-content {
  flex-grow: 1;
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-pane {
  background-color: #1f1f1f;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
  animation: fade-in 0.5s ease-out;
  flex-grow: 1;
  overflow: hidden;
}

.profile-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.profile-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  flex-grow: 1;
  overflow: hidden;
}

.profile-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
}

.map-container {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 48px - 2rem - 60px - 2rem - 1.5rem);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.popup {
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
  color: #333;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-height: calc(100vh - 48px - 2rem - 60px - 2rem - 40px);
  padding: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #42b983 #2a2a2a;
}

.cart-products-list {
  max-height: calc(100vh - 48px - 2rem - 60px - 2rem - 60px - 2rem);
}

.products-tab-list {
  max-height: calc(100vh - 48px - 2rem - 60px - 2rem - 40px);
}

.products-list::-webkit-scrollbar {
  width: 8px;
}

.products-list::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.products-list::-webkit-scrollbar-thumb {
  background: #42b983;
  border-radius: 4px;
}

.products-list::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

.product-card {
  background: linear-gradient(145deg, #2a2a2a, #252525);
  border-radius: 12px;
  max-width: 500px;
  box-sizing: border-box;
  margin: 0;
  padding: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ccc;
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.25);
  border: 1px solid rgba(66, 185, 131, 0.15);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.4);
  transform: translateY(-6px);
}

.product-image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 1rem;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0;
  text-align: center;
  color: #eee;
}

.product-card p {
  font-size: 0.95rem;
  margin: 0.3rem 0;
  color: #aaa;
  text-align: center;
}

.card-buttons {
  margin-top: auto;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}

.product-card button {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-size: 0.9rem;
}

.product-card button:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.quantity-btn {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  font-size: 1rem;
}

.quantity-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.quantity-display {
  font-size: 1rem;
  color: #ccc;
  padding: 0 0.6rem;
}

.search-bar {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #eee;
  height: 40px;
  box-sizing: border-box;
}

.profile-row {
  margin-bottom: 1rem;
}

.profile-row label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.3rem;
  color: #999;
}

.profile-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 300px;
}

.profile-input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #eee;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  width: 100%;
  box-sizing: border-box;
}

.profile-input:disabled {
  background-color: #333;
  color: #888;
  cursor: not-allowed;
}

.logout-btn,
.login-btn,
.order-btn,
.clear-cart-btn,
.order-history-btn,
.active-orders-btn {
  background-color: #42b983;
  border: none;
  padding: 0.6rem 1.2rem;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}

.order-btn:hover,
.clear-cart-btn:hover,
.login-btn:hover,
.order-history-btn:hover,
.active-orders-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.clear-cart-btn {
  background-color: #e11d48;
  margin-left: 1rem;
}

.clear-cart-btn:hover {
  background-color: #be123c;
}

.logout-btn {
  background-color: #e11d48;
}

.logout-btn:hover {
  background-color: #be123c;
  transform: scale(1.05);
}

.message {
  color: #10b981;
}

.error {
  color: #ef4444;
}

.order-section {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  flex-shrink: 0;
  height: 60px;
  box-sizing: border-box;
}

.total-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #10b981;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .products-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-content {
    flex-direction: column;
    gap: 1rem;
  }

  .map-section {
    max-width: 100%;
  }

  .map-container {
    height: 300px;
  }
}

@media (max-width: 600px) {
  .products-list {
    grid-template-columns: repeat(1, 1fr);
    padding: 0.5rem;
  }

  .profile-input-wrapper {
    max-width: 250px;
  }

  .map-container {
    height: 200px;
  }
}
</style>