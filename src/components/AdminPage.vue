<template>
  <div class="user-list-container">
    <div class="top-bar">
      <button class="exit-btn" @click="exitAdminPanel">Выйти из админ панели</button>
      <button class="order-list-btn" @click="goToOrderList">Список товаров для заказа</button>
      <button class="add-product-btn" @click="goToAddProduct">Управление товарами</button>
    </div>
    <h1 class="title">Список пользователей</h1>

    <div class="search-bar">
      <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск по имени или email..."
          class="search-input"
      />
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
        <tr>
          <th>Имя пользователя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Создан</th>
          <th>Активен</th>
          <th>Заблокирован</th>
          <th>История</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in filteredUsers" :key="user.id" class="row">
          <td>{{ user.username }}</td>
          <td>
            <a :href="`mailto:${user.email}`" class="email-link">
              {{ user.email }}
            </a>
          </td>
          <td>
            <select
                :value="user.currentRole"
                @change="onRoleChange(user, $event)"
                class="role-select"
                :disabled="user.id === currentUserId"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </td>
          <td>{{ formatDate(user.created) }}</td>
          <td>
            <span :class="user.enabled ? 'status-active' : 'status-inactive'">
              {{ user.enabled ? 'Да' : 'Нет' }}
            </span>
          </td>
          <td>
            <span :class="user.locked ? 'status-locked' : 'status-unlocked'">
              {{ user.locked ? 'Да' : 'Нет' }}
            </span>
          </td>
          <td>
            <button
                class="history-btn"
                @click="goToHistory(user.id)"
                title="Посмотреть историю заказов"
            >
              История
            </button>
          </td>
          <td>
            <button
                class="block-btn"
                @click="onBlockToggle(user)"
                :disabled="user.id === currentUserId"
                title="Заблокировать/Разблокировать пользователя"
            >
              {{ user.locked ? 'Разблокировать' : 'Заблокировать' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showConfirm" class="modal-overlay">
      <div class="modal-content">
        <p class="modal-text" v-html="confirmMessage"></p>
        <div class="modal-buttons">
          <button @click="confirmAction" class="confirm-btn">Да</button>
          <button @click="cancelAction" class="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="alertMessage" :class="['custom-alert', alertType]">
        {{ alertMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import axios from 'axios'
import {useRouter} from 'vue-router'

const router = useRouter()

const users = ref([])
const searchQuery = ref('')
const currentUserId = ref(null)

const showConfirm = ref(false)
const userToUpdate = ref(null)
const actionType = ref(null)
const newRole = ref(null)
const newLockedStatus = ref(null)

const alertMessage = ref('')
const alertType = ref('')

function normalizeRole(role) {
  return role?.startsWith('ROLE_') ? role.replace('ROLE_', '') : role
}

onMounted(async () => {
  try {
    const meRes = await axios.get('/api/users/me', {withCredentials: true})
    currentUserId.value = meRes.data.id

    const res = await axios.get('/api/admin/users', {withCredentials: true})
    users.value = res.data.map((u) => ({
      ...u,
      currentRole: normalizeRole(u.role || 'USER'),
    }))
  } catch (e) {
    showAlert('Ошибка при загрузке пользователей, попробуйте перезайти в аккаунт', 'error')
    console.error('Ошибка при загрузке пользователей', e)
  }
})

const filteredUsers = computed(() =>
    users.value.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU')
}

function onRoleChange(user, event) {
  const selectedRole = event.target.value
  if (selectedRole === user.currentRole) return

  userToUpdate.value = user
  newRole.value = selectedRole
  actionType.value = 'role'
  showConfirm.value = true
}

async function confirmAction() {
  if (actionType.value === 'role') {
    await updateRole()
  } else if (actionType.value === 'block') {
    await updateBlockStatus()
  }
}

function exitAdminPanel() {
  router.push('/')
}

function goToAddProduct() {
  router.push('/admin/add-product')
}

async function updateRole() {
  try {
    await axios.put(
        `/api/admin/${userToUpdate.value.id}/role`,
        {role: newRole.value},
        {withCredentials: true}
    )
    userToUpdate.value.currentRole = newRole.value
    showAlert('Роль успешно обновлена', 'success')
  } catch (e) {
    console.error('Ошибка при обновлении роли', e)
    showAlert('Не удалось обновить роль', 'error')
  } finally {
    resetConfirmation()
  }
}

function goToOrderList() {
  router.push('/admin/orders')
}

function onBlockToggle(user) {
  userToUpdate.value = user
  newLockedStatus.value = !user.locked
  actionType.value = 'block'
  showConfirm.value = true
}

async function updateBlockStatus() {
  try {
    const response = await axios.put(
        `http://localhost:8080/api/admin/${userToUpdate.value.id}/lock`,
        JSON.stringify(newLockedStatus.value),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
    )
    console.log(response.status);
    userToUpdate.value.locked = newLockedStatus.value
    showAlert(
        newLockedStatus.value ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
        'success'
    )
  } catch (e) {
    console.error('Ошибка при обновлении блокировки', e)
    showAlert('Не удалось изменить статус блокировки', 'error')
  } finally {
    resetConfirmation()
  }
}

function resetConfirmation() {
  showConfirm.value = false
  userToUpdate.value = null
  newRole.value = null
  newLockedStatus.value = null
  actionType.value = null
}

function cancelAction() {
  resetConfirmation()
}

const confirmMessage = computed(() => {
  if (!userToUpdate.value) return ''
  if (actionType.value === 'role') {
    return `Вы уверены, что хотите изменить роль пользователя <strong>${userToUpdate.value.username}</strong> на <strong>${newRole.value}</strong>?`
  }
  if (actionType.value === 'block') {
    return `Вы уверены, что хотите ${newLockedStatus.value ? 'заблокировать' : 'разблокировать'} пользователя <strong>${userToUpdate.value.username}</strong>?`
  }
  return ''
})

function showAlert(message, type = 'success') {
  alertMessage.value = message
  alertType.value = type
  setTimeout(() => {
    alertMessage.value = ''
    alertType.value = ''
  }, 3500)
}

function goToHistory(userId) {
  router.push(`/user/${userId}/orders-history`)
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.exit-btn,
.add-product-btn,
.order-list-btn {
  background-color: #2d2d2d;
  color: #eee;
  border: 1px solid #444;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.order-list-btn:hover {
  background-color: #286bcb;
  color: white;
}

.exit-btn:hover {
  background-color: #ef4444;
  color: white;
}

.add-product-btn:hover {
  background-color: #22c55e;
  color: white;
}

.user-list-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 2rem;
  background-color: #181818;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
  color: #ccc;
  font-family: Arial, sans-serif;
  animation: fade-in 0.6s ease-out;
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

.title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #a0a0a0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-bar {
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-input {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #333;
  background-color: #222;
  color: #eee;
  width: 60%;
  font-size: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #1f1f1f;
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.95rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  min-width: 900px;
}

thead {
  background-color: #2d2d2d;
  color: #ccc;
  text-transform: uppercase;
  font-size: 0.8rem;
}

th, td {
  padding: 14px 12px;
  border-bottom: 1px solid #333;
  text-align: left;
  vertical-align: middle;
}

.row:hover {
  background-color: #2b2b2b;
  transition: background-color 0.3s ease;
}

.email-link {
  color: #42b983;
  text-decoration: underline;
}

.email-link:hover {
  color: #369e72;
}

.role-select {
  background-color: #2c2c2c;
  color: #a7f3d0;
  border: 1px solid #444;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 85px;
}

.status-active {
  color: #22c55e;
  font-weight: 600;
}

.status-inactive {
  color: #ef4444;
  font-weight: 600;
}

.status-locked {
  color: #dc2626;
  font-weight: 600;
}

.status-unlocked {
  color: #10b981;
  font-weight: 600;
}


.block-btn {
  background-color: #dc2626;
  border: none;
  padding: 5px 10px;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
}

.block-btn:hover:not(:disabled) {
  background-color: #b91c1c;
}

.block-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.history-btn {
  background-color: #42b983;
  border: none;
  padding: 5px 10px;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
}

.history-btn:hover {
  background-color: #369e72;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(24, 24, 24, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #222;
  padding: 20px 30px;
  border-radius: 12px;
  color: #eee;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 0 12px #42b983;
  font-size: 1rem;
  line-height: 1.4;
}

.modal-text strong {
  font-weight: 700;
  color: #42b983;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.confirm-btn {
  background-color: #22c55e;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.confirm-btn:hover {
  background-color: #16a34a;
}

.cancel-btn {
  background-color: #ef4444;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #b91c1c;
}


.custom-alert {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
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

.custom-alert.success {
  background-color: #22c55e;
  box-shadow: 0 0 15px #22c55e;
}

.custom-alert.error {
  background-color: #ef4444;
  box-shadow: 0 0 15px #ef4444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


.table-wrapper {
  overflow-x: auto;
}

button {
  white-space: nowrap;
}

td > button + button {
  margin-left: 8px;
}
</style>