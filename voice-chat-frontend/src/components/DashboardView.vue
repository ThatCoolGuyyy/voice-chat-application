<template>
    <div class="dashboard">
      <h2>Welcome, {{ user.username }}</h2>
      <h3>Online Users</h3>
      <ul class="online-users">
        <li v-for="onlineUser in onlineUsers" :key="onlineUser.id" @click="initiateCall(onlineUser)" class="user-item">
          {{ onlineUser.username }}
          <span class="status-dot online"></span>
        </li>
      </ul>
  
      <!-- Incoming Call Modal -->
      <div v-if="incomingCall" class="call-modal">
        <h3>Incoming Call from {{ incomingCall.username }}</h3>
        <button @click="acceptCall">Accept</button>
        <button @click="rejectCall">Reject</button>
      </div>
  
      <div v-if="rejectionMessage" class="rejection-notification">
        {{ rejectionMessage }}
      </div>
  
    </div>
  </template>

  <script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// State
const onlineUsers = ref([])
const socket = ref(null)
const incomingCall = ref(null)
const callRejected = ref(null)
const rejectionMessage = ref(null);

// Computed
const user = computed(() => store.state.user)

// Lifecycle hooks
onMounted(() => {
  connectSocket()
})

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})

// Methods
function connectSocket() {
  if (store.state.socket) {
    // Use the existing socket connection
    socket.value = store.state.socket;
  } else {
    // Initialize socket if not already connected
    store.dispatch('initializeSocket');
    socket.value = store.state.socket;
  }

  socket.value.on('updateOnlineUsers', (users) => {
    onlineUsers.value = Object.entries(users)
      .map(([userId, username]) => ({ userId: Number(userId), username }))
      .filter((u) => u.userId !== user.value.id);
  });

  socket.value.on('incomingCall', (data) => {
    incomingCall.value = data;
  });

  socket.value.on('callRejected', (data) => {
    rejectionMessage.value = data.message;
    setTimeout(() => {
      rejectionMessage.value = null;
      router.push({ name: 'dashboard' });
    }, 2000);
  });
}

function initiateCall(callUser) {
  socket.value.emit('initiateCall', {
    callerId: user.value.id,
    callerUsername: user.value.username,
    calleeId: callUser.userId,
  })
  if (!callRejected.value) {
    router.push({
      name: 'call',
      params: {
        userId: callUser.userId,
        username: callUser.username,
      },
    })
  }

}

function acceptCall() {
  if (incomingCall.value) {
    callRejected.value = false
    socket.value.emit('acceptCall', {
      callerId: incomingCall.value.from,
      calleeId: user.value.id,
      calleeUsername: user.value.username,
    })
    router.push({
      name: 'call',
      params: {
        userId: incomingCall.value.from,
        username: incomingCall.value.username,
      },
      query: {
        accepted: 'true'
      }
    })
    store.commit('setSocket', socket.value)
    incomingCall.value = null
  }
}

function rejectCall() {
  callRejected.value = true;
  socket.value.emit('callRejected', {
    callerId: incomingCall.value.from,
    message: 'Your call was rejected by the callee.',
  });
  incomingCall.value = null
}

</script>

<style scoped>
.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 10px;
}

.online {
  background-color: #4CAF50;
}

.call-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rejection-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4d4f;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>