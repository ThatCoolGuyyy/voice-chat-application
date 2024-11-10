<template>
    <div class="register-form">
      <h2>Register</h2>
      <input v-model="username" placeholder="Username" />
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="handleRegister">Register</button>
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const router = useRouter()
  
  // State
  const username = ref('')
  const email = ref('')
  const password = ref('')
  
  // Methods
  async function handleRegister() {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local/register', {
        username: username.value,
        email: email.value,
        password: password.value,
      })
      console.log('User registered successfully:', response.data)
      router.push('/login')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }
  </script>