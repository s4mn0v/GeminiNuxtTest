<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">

    <div class="w-10/10 h-[95vh] bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-xl font-bold text-center mb-4 text-gray-700">Prueba consultorio</h1>
      

      <div class="h-6/7 overflow-y-auto border p-3 rounded-lg bg-gray-50">
        <div v-for="(msg, index) in chatHistory" :key="index" :class="msg.sender === 'user' ? 'text-right' : 'text-left'">
          <p class="inline-block p-2 m-1 rounded-lg"
            :class="msg.sender === 'user' ? 'bg-blue-500 text-yellow-200' : 'bg-gray-300 text-gray-900'"
            v-html="formatMessage(msg.text)">
          </p>
        </div>
      </div>

      <div class="mt-4 flex">
        <input
          v-model="message"
          @keydown.enter="sendMessage"
          class="flex-1 p-3 h-12 border rounded-lg text-gray-700"
          placeholder="Escribe un mensaje..."
        />
        <button @click="sendMessage" :disabled="loading"
          class="ml-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg">
          {{ loading ? "..." : "Enviar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const message = ref("");
const chatHistory = ref([]);
const loading = ref(false);

const sendMessage = async () => {
  if (!message.value.trim()) return;
  
  chatHistory.value.push({ sender: "user", text: message.value });
  loading.value = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.value })
    });

    const data = await res.json();
    if (data.response) {
      chatHistory.value.push({ sender: "bot", text: data.response });
    }
  } catch (error) {
    chatHistory.value.push({ sender: "bot", text: "Error al obtener respuesta." });
  } finally {
    loading.value = false;
    message.value = "";
  }
};

// Función para convertir **texto** en negrita en HTML
const formatMessage = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};
</script>