<template>
  <div class="page-container">
    <header class="tabs-header">
      <div class="tabs-buttons">
        <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: currentTab === tab }]"
            @click="currentTab = tab"
        >
          {{ tab }}
        </button>
      </div>
      <button class="back-btn" @click="exitAdminPanel">Назад</button>
    </header>

    <main class="tab-content">
      <div v-if="currentTab === 'Добавить производителя'" class="tab-pane">
        <h2 class="centered">Добавить производителя</h2>
        <form @submit.prevent="submitManufacturer" class="product-form">
          <label class="form-label" for="manufacturer-name">Название производителя</label>
          <input
              id="manufacturer-name"
              placeholder="Введите название производителя"
              type="text"
              v-model="manufacturerForm.name"
              class="form-input"
              required
              maxlength="100"
          />
          <label class="form-label" for="manufacturer-description">Описание</label>
          <textarea
              id="manufacturer-description"
              v-model="manufacturerForm.description"
              class="form-textarea"
              placeholder="Опишите производителя"
              rows="3"
              maxlength="500"
          ></textarea>
          <label class="form-label" for="manufacturer-country">Страна</label>
          <v-select
              id="manufacturer-country"
              v-model="manufacturerForm.country"
              :options="countries"
              :get-option-label="option => option.name"
              placeholder="Выберите или найдите страну"
              class="form-select dark-theme"
              required
          ></v-select>
          <button type="submit" class="submit-btn">Добавить производителя</button>
        </form>
      </div>
      <div v-else-if="currentTab === 'Добавить товар'" class="tab-pane">
        <h2 class="centered">Добавить товар</h2>
        <form @submit.prevent="submitProduct" class="product-form">
          <label class="form-label" for="name">Название товара</label>
          <input
              id="name"
              placeholder="Как называется данный товар?"
              type="text"
              v-model="productForm.name"
              class="form-input"
              required
              maxlength="100"
          />
          <label class="form-label" for="description">Описание</label>
          <textarea
              id="description"
              v-model="productForm.description"
              class="form-textarea"
              placeholder="Что мы продаем?"
              rows="3"
              maxlength="500"
          ></textarea>
          <label class="form-label" for="price">Цена (₽)</label>
          <input
              id="price"
              type="number"
              v-model.number="productForm.price"
              class="form-input"
              placeholder="Сколько стоит?"
              min="0"
              required
          />
          <label class="form-label" for="manufacturer">Производитель</label>
          <v-select
              id="manufacturer"
              v-model="productForm.manufacturerName"
              :options="manufacturers"
              :get-option-label="option => option.name"
              :reduce="option => option.name"
              placeholder="Выберите или найдите производителя"
              class="form-select dark-theme"
              required
          ></v-select>
          <label class="form-label">Фото товара</label>
          <div
              class="image-upload"
              @click="triggerFileInput"
              title="Нажмите для выбора фото"
          >
            <template v-if="imagePreview">
              <img :src="imagePreview" alt="Превью фото" class="image-preview"/>
              <div class="image-overlay">Изменить</div>
            </template>
            <template v-else>
              <div class="plus-icon">+</div>
            </template>
          </div>
          <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="onFileChange"
              style="display: none"
          />
          <button type="submit" class="submit-btn">Добавить товар</button>
        </form>
      </div>

      <div v-else-if="currentTab === 'Список товаров'" class="tab-pane">
        <h2>Список товаров</h2>
        <input
            v-model="searchQuery"
            placeholder="Поиск по названию..."
            class="search-bar"
        />
        <div class="products-list">
          <div class="product-header">
            <div class="product-field">Название</div>
            <div class="product-field">Описание</div>
            <div class="product-field">Цена (₽)</div>
            <div class="product-field">Производитель</div>
            <div class="product-field">Фото</div>
            <div class="product-field">Действия</div>
          </div>
          <div v-if="filteredProducts.length === 0">Товары отсутствуют</div>
          <div v-for="product in filteredProducts" :key="product.id" class="product-row">
            <div class="product-field">
              <span>{{ product.name }}</span>
            </div>
            <div class="product-field">
              <span>{{ product.description || '—' }}</span>
            </div>
            <div class="product-field">
              <span>{{ product.price }} ₽</span>
            </div>
            <div class="product-field">
              <span>{{ product.manufacturer?.name || '—' }}</span>
            </div>
            <div class="product-field image-field">
              <img
                  v-if="product.image?.imageData"
                  :src="`data:${product.image.contentType};base64,${product.image.imageData}`"
                  alt="image"
                  class="product-image"
                  @click="openImageModal(product.image)"
              />
            </div>
            <div class="product-field">
              <button class="delete-btn" @click="confirmDeleteProduct(product.id)">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="alertMessage" :class="['alert', alertType]">{{ alertMessage }}</div>
      </transition>

      <transition name="fade">
        <div v-if="showConfirmAlert" class="confirm-alert">
          <div class="confirm-alert-content">
            <p>Вы уверены, что хотите удалить товар?</p>
            <div class="confirm-alert-buttons">
              <button class="confirm-btn" @click="deleteProductConfirmed">Да</button>
              <button class="cancel-btn" @click="cancelDelete">Нет</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
          <div class="image-modal-content" @click.stop>
            <img :src="selectedImageSrc" alt="Увеличенное изображение" class="enlarged-image"/>
            <button class="close-modal-btn" @click="closeImageModal">×</button>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from 'axios';
import {useRouter} from 'vue-router';
import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const router = useRouter();
const tabs = ['Добавить производителя', 'Добавить товар', 'Список товаров'];
const currentTab = ref('Добавить товар');
const manufacturerForm = ref({
  name: '',
  description: '',
  country: null
});
const productForm = ref({
  name: '',
  description: '',
  price: null,
  manufacturerName: '',
  imageFile: null
});
const manufacturers = ref([]);
const products = ref([]);
const countries = ref([]);
const imagePreview = ref(null);
const alertMessage = ref('');
const alertType = ref('');
const fileInput = ref(null);
const searchQuery = ref('');
const showConfirmAlert = ref(false);
const productToDelete = ref(null);
const showImageModal = ref(false);
const selectedImageSrc = ref('');

const filteredProducts = computed(() => {
  return products.value.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  try {
    const [manRes, prodRes, countryRes] = await Promise.all([
      axios.get('/api/admin/manufacturer', {withCredentials: true}),
      axios.get('/api/product', {withCredentials: true}),
      axios.get('/api/country', {withCredentials: true})
    ]);
    manufacturers.value = manRes.data;
    products.value = prodRes.data.map(product => ({
      ...product,
      manufacturerName: product.manufacturer?.name || ''
    }));
    countries.value = countryRes.data.sort((a, b) =>
        a.name.localeCompare(b.name)
    );
  } catch (e) {
    showAlert('Ошибка загрузки данных', 'error');
    console.error('Error loading data:', e);
  }
});

function triggerFileInput() {
  fileInput.value.click();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    productForm.value.imageFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    productForm.value.imageFile = null;
    imagePreview.value = null;
    showAlert('Выберите корректный файл изображения', 'error');
  }
}

async function submitManufacturer() {
  if (!manufacturerForm.value.name) {
    showAlert('Введите название производителя', 'error');
    return;
  }
  if (!manufacturerForm.value.country) {
    showAlert('Выберите страну', 'error');
    return;
  }
  try {
    const payload = {
      name: manufacturerForm.value.name,
      description: manufacturerForm.value.description,
      country: manufacturerForm.value.country.name
    };
    const res = await axios.post('/api/admin/manufacturer', payload, {
      withCredentials: true
    });
    manufacturers.value.push(res.data);
    manufacturerForm.value = {name: '', description: '', country: null};
    showAlert('Производитель успешно добавлен', 'success');
  } catch (e) {
    showAlert('Ошибка при добавлении производителя: ' + (e.response?.data || e.message), 'error');
    console.error('Error submitting manufacturer:', e);
  }
}

async function submitProduct() {
  if (!productForm.value.imageFile) {
    showAlert('Пожалуйста, загрузите фото товара', 'error');
    return;
  }
  if (!productForm.value.manufacturerName) {
    showAlert('Пожалуйста, выберите производителя', 'error');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('name', productForm.value.name);
    formData.append('description', productForm.value.description);
    formData.append('price', productForm.value.price);
    formData.append('manufacturerName', productForm.value.manufacturerName);
    formData.append('imageFile', productForm.value.imageFile);

    const res = await axios.post('/api/admin/products', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      withCredentials: true
    });
    products.value.push({...res.data, manufacturerName: res.data.manufacturer?.name || ''});
    productForm.value = {
      name: '',
      description: '',
      price: null,
      manufacturerName: '',
      imageFile: null
    };
    imagePreview.value = null;
    showAlert('Товар успешно добавлен', 'success');
  } catch (e) {
    showAlert('Ошибка при добавлении товара: ' + (e.response?.data || e.message), 'error');
    console.error('Error submitting product:', e);
  }
}

function confirmDeleteProduct(productId) {
  productToDelete.value = productId;
  showConfirmAlert.value = true;
}

async function deleteProductConfirmed() {
  const productId = productToDelete.value;
  try {
    await axios.delete(`/api/admin/product/${productId}`, {withCredentials: true});
    products.value = products.value.filter(p => p.id !== productId);
    showAlert('Товар удалён', 'success');
  } catch (e) {
    showAlert('Ошибка при удалении товара: ' + (e.response?.data || e.message), 'error');
    console.error('Error deleting product:', e);
  }
  showConfirmAlert.value = false;
  productToDelete.value = null;
}

function cancelDelete() {
  showConfirmAlert.value = false;
  productToDelete.value = null;
}

function openImageModal(image) {
  if (image?.imageData) {
    selectedImageSrc.value = `data:${image.contentType};base64,${image.imageData}`;
    showImageModal.value = true;
  }
}

function closeImageModal() {
  showImageModal.value = false;
  selectedImageSrc.value = '';
}

function exitAdminPanel() {
  router.push('/admin');
}

function showAlert(msg, type = 'success') {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    alertMessage.value = '';
    alertType.value = '';
  }, 3500);
}
</script>

<style>
.page-container {
  height: 100vh;
  width: 100%;
  background-color: #121212;
  color: #ccc;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #181818;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid #2a2a2a;
}

.back-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 1rem;
  align-self: center;
}

.back-btn:hover {
  background-color: #2563eb;
}

.tabs-buttons {
  display: flex;
  flex-grow: 1;
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
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn:hover,
.tab-btn.active {
  background-color: #42b983;
  color: white;
}

.tab-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}

.tab-pane {
  background-color: #1f1f1f;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
  animation: fade-in 0.5s ease-out;
  position: relative;
}

.centered {
  text-align: center;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(100%, 450px);
  margin: 0 auto;
  box-sizing: border-box;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #a0a0a0;
}

.form-input,
.form-textarea,
.form-select {
  background-color: #222;
  border: 1px solid #333;
  border-radius: 8px;
  color: #eee;
  font-size: 0.9rem;
  padding: 8px 10px;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #42b983;
  outline: none;
}

.form-textarea {
  resize: none;
  height: 70px;
}

.form-select .v-select {
  background-color: #222;
  border: 1px solid #333;
  border-radius: 8px;
  color: #eee;
}

.form-select .vs__dropdown-toggle {
  background-color: #222;
  border: none;
  color: #eee;
  max-width: 100%;
}

.form-select .vs__search,
.form-select .vs__selected {
  color: #eee;
}

.form-select .vs__dropdown-menu {
  background-color: #2a2a2a;
  border: 1px solid #333;
  color: #eee;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.form-select .vs__dropdown-option {
  color: #ccc;
  padding: 5px 10px;
}

.form-select .vs__dropdown-option:hover,
.form-select .vs__dropdown-option--highlight {
  background-color: #42b983;
  color: white;
}

.image-upload {
  width: 120px;
  height: 120px;
  border: 2px dashed #42b983;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #42b983;
  font-size: 3.5rem;
  font-weight: 900;
  user-select: none;
  transition: background-color 0.3s ease;
}

.dark-theme .vs__dropdown-toggle {
  background-color: #2c2c2c !important;
  color: #eee !important;
  border: 1px solid #555 !important;
}

.dark-theme .vs__dropdown-menu {
  background-color: #2c2c2c !important;
  color: #eee !important;
  border: 1px solid #555 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.dark-theme .vs__dropdown-option {
  background-color: #2c2c2c;
  color: #eee;
  padding: 8px 12px;
  cursor: pointer;
}

.dark-theme .vs__dropdown-option--selected {
  background-color: #444;
  color: #fff;
}

.dark-theme .vs__dropdown-option--highlight {
  background-color: #555;
  color: #fff;
}

.dark-theme .vs__search {
  color: #ccc;
}

.image-upload:hover {
  background-color: rgba(66, 185, 131, 0.15);
}

.plus-icon {
  line-height: 0;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #42b983;
  font-weight: 600;
  text-align: center;
  padding: 4px 0;
  font-size: 0.85rem;
  border-radius: 0 0 12px 12px;
  user-select: none;
}

.submit-btn {
  margin-top: 16px;
  padding: 10px 0;
  font-weight: 700;
  font-size: 1rem;
  background-color: #22c55e;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.submit-btn:hover {
  background-color: #16a34a;
}

.search-bar {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #eee;
  font-size: 0.9rem;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-header {
  display: flex;
  align-items: center;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  gap: 1rem;
  color: #a0a0a0;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.product-row {
  display: flex;
  align-items: center;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  gap: 1rem;
  color: #ccc;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.4);
}

.product-row:hover {
  box-shadow: 0 0 12px rgba(66, 185, 131, 0.6);
}

.product-field {
  flex: 1;
  min-width: 100px;
}

.product-field span {
  display: block;
  padding: 0.5rem;
}

.image-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.delete-btn {
  background-color: #e11d48;
  border: none;
  padding: 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: #be123c;
}

.alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 14px 28px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  z-index: 10000;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  user-select: none;
  pointer-events: none;
}

.alert.success {
  background-color: #22c55e;
  box-shadow: 0 0 15px #22c55e;
}

.alert.error {
  background-color: #ef4444;
  box-shadow: 0 0 15px #ef4444;
}

.confirm-alert {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.confirm-alert-content {
  background-color: #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #ccc;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  width: 90%;
}

.confirm-alert-content p {
  margin: 0 0 1.5rem;
  font-size: 1rem;
}

.confirm-alert-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.confirm-btn,
.cancel-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-btn {
  background-color: #e11d48;
  color: white;
}

.confirm-btn:hover {
  background-color: #be123c;
}

.cancel-btn {
  background-color: #42b983;
  color: white;
}

.cancel-btn:hover {
  background-color: #059669;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10002;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.enlarged-image {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
  object-fit: contain;
}

.close-modal-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #e11d48;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.close-modal-btn:hover {
  background-color: #be123c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.form-select .vs__dropdown-menu {
  background-color: #2a2a2a !important;
  color: #ccc !important;
}

.form-select .vs__dropdown-option {
  color: #ccc !important;
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
</style>