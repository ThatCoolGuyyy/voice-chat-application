<template>
    <div class="call-interface">
      <h2>Call with {{ callee.username }}</h2>
      <div v-if="connectionStatus" class="status-message">
        {{ connectionStatus }}
      </div>
      <div v-if="connectionError" class="error-message">
        {{ connectionError }}
      </div>
      <button @click="endCall" v-else>End Call</button>
      <audio ref="remoteAudio" autoplay playsinline></audio>
    </div>
  </template>
  <script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Peer from 'peerjs'

const route = useRoute()
const router = useRouter()
const store = useStore()

// Core refs
const peer = ref(null)
const call = ref(null)
const remoteAudio = ref(null)
const localStream = ref(null)

// UI state
const callActive = ref(false)
const isPeerConnected = ref(false)
const isConnecting = ref(false)
const connectionStatus = ref('')
const connectionError = ref('')

// User data
const callee = ref({ id: null, username: '' })
const currentUser = computed(() => store.state.user)

onMounted(async () => {
  const userId = route.params.userId
  const username = route.params.username
  const callAccepted = route.query.accepted

  if (!userId || !username) {
    console.error("Missing userId or username in route parameters")
    router.push('/dashboard')
    return
  }

  callee.value = { id: Number(userId), username }

  try {
    await initializePeer()
    if (callAccepted === 'true') {
      await startCall()
    }
  } catch (error) {
    connectionError.value = `Failed to initialize: ${error.message}`
  }
})

onUnmounted(() => {
  cleanup()
})

async function initializePeer() {
  try {
    connectionStatus.value = 'Initializing connection...'

    // Create a single peer for the current user
    peer.value = new Peer(currentUser.value.id.toString(), {
      host: 'localhost',
      port: 9000,
      path: '/myapp',
      debug: 3,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    })

    // Set up event handlers for this peer
    peer.value.on('open', () => {
      isPeerConnected.value = true
      connectionStatus.value = 'Connected to server'
    })

    peer.value.on('call', handleIncomingCall)

    peer.value.on('error', (error) => {
      connectionError.value = `Connection error: ${error.message}`
      cleanup()
    })

    peer.value.on('disconnected', () => {
      connectionStatus.value = 'Disconnected, attempting to reconnect...'
      isPeerConnected.value = false
      peer.value?.reconnect()
    })

    peer.value.on('close', () => {
      cleanup()
    })

  } catch (error) {
    console.error('Peer initialization error:', error)
    throw error
  }
}
async function startCall() {
  try {
    isConnecting.value = true
    connectionError.value = ''
    connectionStatus.value = 'Getting audio access...'

    // Get local audio stream
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })

    // Initiate call to the other user
    connectionStatus.value = 'Calling...'
    call.value = peer.value.call(callee.value.id.toString(), localStream.value)

    if (!call.value) {
      throw new Error('Failed to initiate call')
    }

    setupCallHandlers(call.value)

  } catch (error) {
    console.error('Call failed:', error)
    connectionError.value = `Call failed: ${error.message}`
    cleanup()
  } finally {
    isConnecting.value = false
  }
}

async function handleIncomingCall(incomingCall) {
  try {
    connectionStatus.value = 'Incoming call...'

    // Get local audio stream if we don't have it yet
    if (!localStream.value) {
      localStream.value = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    }

    // Answer the call with our audio stream
    incomingCall.answer(localStream.value)
    setupCallHandlers(incomingCall)

  } catch (error) {
    console.error('Failed to handle incoming call:', error)
    connectionError.value = `Failed to answer: ${error.message}`
    incomingCall.close()
  }
}

function setupCallHandlers(currentCall) {
  currentCall.on('stream', (remoteStream) => {

    if (remoteAudio.value) {
      // Ensure remote stream has audio tracks
      const audioTracks = remoteStream.getAudioTracks()

      if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = true
        })
      } else {
        console.warn("No audio tracks in remote stream")
        return
      }

      try {
        // Set the remote stream and attempt playback
        remoteAudio.value.srcObject = remoteStream
        const playPromise = remoteAudio.value.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Only set call as active if audio is actually playing
              callActive.value = true
              connectionStatus.value = 'Call connected'
              connectionError.value = ''
            })
            .catch(error => {
              console.error("Audio playback failed:", error)
              connectionError.value = 'Audio playback failed'
            })
        }
      } catch (error) {
        console.error("Error setting up audio:", error)
        connectionError.value = 'Failed to setup audio'
      }
    }
  })

  currentCall.on('close', () => {
    cleanup()
  })

  currentCall.on('error', (error) => {
    connectionError.value = `Call error: ${error.message}`
    cleanup()
  })
}

function cleanup() {
  // Stop all audio tracks
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
  }

  // Close the call
  if (call.value) {
    call.value.close()
    call.value = null
  }

  // Destroy the peer connection
  if (peer.value) {
    peer.value.destroy()
    peer.value = null
  }

  // Reset all state
  callActive.value = false
  isPeerConnected.value = false
  isConnecting.value = false
  connectionStatus.value = ''
  connectionError.value = ''
}

function endCall() {
  cleanup()
}
</script>