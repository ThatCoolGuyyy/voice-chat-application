import { createStore } from "vuex";
import axios from "axios";
import io from "socket.io-client";

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    socket: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
  },
  actions: {
    async login({ commit, dispatch }, { identifier, password }) {
      try {
        const response = await axios.post(
          "http://localhost:1337/api/auth/local", // Strapi login endpoint
          {
            identifier,
            password,
          }
        );
        const { user, jwt } = response.data;
        commit("setUser", user);
        commit("setToken", jwt);
        
        // Initialize socket after login
        await dispatch("initializeSocket");
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    
    async initializeSocket({ commit, state }) {
      if (!state.user) return; // Ensure user is logged in before connecting
      
      // Initialize socket connection
      const socket = io("http://localhost:1337", {
        transports: ["websocket"],
        path: "/ws",
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        socket.emit("userConnected", { userId: state.user.id, username: state.user.username });
      });

      

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        // socket.emit("userDisconnected", { userId: state.user.id });
      });

      // Store socket instance in state
      commit("setSocket", socket);
    },

    logout({ commit, state }) {
      // Remove user data from local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Disconnect socket if it exists
      if (state.socket) {
        state.socket.emit("userDisconnected", { userId: state.user.id });
        state.socket.disconnect();
      }

      // Clear state
      commit("setUser", null);
      commit("setToken", null);
      commit("setSocket", null);
    },
  },
});