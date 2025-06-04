<template>
  <div class="product-details-container">
    <h2>{{ product?.name || 'Loading...' }}</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="product-details">
      <div class="product-image-wrapper">
        <img
            v-if="product.image?.imageData && product.image?.contentType"
            :src="`data:${product.image.contentType};base64,${product.image.imageData}`"
            alt="Product Image"
            class="product-image"
        />
        <div v-else class="no-image">No image available</div>
      </div>
      <p><strong>Описание:</strong> {{ product.description || 'Нет доступного описания' }}</p>
      <p><strong>Цена:</strong> {{ product.price }} ₽</p>
      <p><strong>Производитель:</strong> {{ product.manufacturer?.name || 'Unknown' }}</p>
      <p><strong>Страна:</strong> {{ product.manufacturer?.country?.name || 'Unknown' }}</p>
      <div class="button-group">
        <button class="back-btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import axios from 'axios'

const {productId, isInCart} = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  isInCart: {
    type: Boolean,
    default: false
  }
})
defineEmits(['add-to-cart', 'close'])

const product = ref(null)
const loading = ref(true)
const error = ref('')

const fetchProduct = async () => {
  try {
    const res = await axios.get(`/api/product/${productId}`, {withCredentials: true})
    product.value = res.data
  } catch (e) {
    error.value = 'Failed to load product details'
    console.error('Error fetching product:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
.product-details-container {
  max-width: 700px;
  width: 90vw;
  margin: 0.8rem auto;
  padding: 1rem;
  background-color: #1f1f1f;
  border-radius: 16px;
  color: #ccc;
  font-family: Arial, sans-serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
  max-height: 85vh;
  overflow-y: hidden;
}

.product-image-wrapper {
  width: 100%;
  height: 400px;
  min-height: 250px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 0.8rem;
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

.product-details p {
  font-size: 1rem;
  margin: 0.4rem 0;
  overflow-wrap: break-word;
}

.product-details strong {
  color: #eee;
}

.button-group {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.8rem;
  justify-content: center;
}

.cart-btn, .back-btn {
  background-color: #42b983;
  border: none;
  padding: 0.6rem 1.2rem;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  font-size: 0.9rem;
}

.cart-btn:hover, .back-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.cart-btn:disabled {
  background-color: #444;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-size: 1rem;
}

@media (max-width: 800px) {
  .product-details-container {
    max-width: 90vw;
    padding: 0.8rem;
  }

  .product-image-wrapper {
    height: 350px;
  }
}

@media (max-width: 600px) {
  .product-details-container {
    max-width: 95vw;
    padding: 0.6rem;
  }

  .product-image-wrapper {
    height: 250px;
  }

  .product-details p {
    font-size: 0.9rem;
  }

  .cart-btn, .back-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
