<template>
    <div class="login-form">
      <h2>Login</h2>
      <input v-model="identifier" placeholder="Username or Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="handleLogin">Login</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  
  const store = useStore()
  const router = useRouter()
  
  // State
  const identifier = ref('')
  const password = ref('')
  
  // Methods
  async function handleLogin() {
    try {
      await store.dispatch('login', {
        identifier: identifier.value,
        password: password.value
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  </script>