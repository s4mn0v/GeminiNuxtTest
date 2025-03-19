<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="w-10/10 h-[95vh] bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-xl font-bold text-center mb-4 text-gray-700">Prueba consultorio</h1>

      <!-- Contenedor del chat -->
      <div class="h-5/6 overflow-y-auto border p-3 rounded-lg bg-gray-50">
        <div v-for="(msg, index) in chatHistory" :key="index"
             :class="msg.sender === 'user' ? 'text-right' : 'text-left'">
          <p class="inline-block p-2 m-1 rounded-lg"
             :class="msg.sender === 'user' ? 'bg-blue-500 text-yellow-200' : 'bg-gray-300 text-gray-900'">
            {{ msg.text }}
          </p>
        </div>
      </div>

      <!-- Entrada de mensajes con botón "+" -->
      <div class="mt-4 flex items-center relative">
        <input v-model="message" @keydown.enter="sendMessage"
          class="flex-1 p-3 h-12 border rounded-lg text-gray-700 pr-12"
          placeholder="Escribe un mensaje..." />

        <!-- Botón "+" para abrir el menú -->
        <button @click="toggleFileUpload"
          class="ml-2 px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-lg relative">
          ＋
        </button>

        <button @click="sendMessage" :disabled="loading"
          class="ml-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg">
          {{ loading ? "..." : "Enviar" }}
        </button>
      </div>

      <!-- Menú emergente de subida (se despliega hacia arriba) -->
      <div v-if="showFileInput"
           class="absolute bottom-16 right-20 w-64 bg-white p-4 rounded-lg shadow-lg border border-gray-300">
        <p class="text-gray-700 font-semibold text-center">Subir archivo</p>
        
        <!-- Input oculto con botón personalizado -->
        <label class="block mt-2 cursor-pointer text-center p-2 border border-dashed rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-200">
          <input type="file" @change="handleFileUpload" accept=".pdf,.doc,.docx,.txt" class="hidden"/>
          Seleccionar archivo
        </label>

        <!-- Mostrar nombre del archivo seleccionado -->
        <p v-if="selectedFile" class="mt-2 text-sm text-gray-700 text-center">
          Archivo: <strong>{{ selectedFile.name }}</strong>
        </p>

        <div class="flex justify-between mt-2">
          <button @click="sendFile" :disabled="!selectedFile || loading"
            class="px-4 py-2 bg-green-500 text-white font-bold rounded-lg">
            {{ loading ? "Procesando..." : "Subir" }}
          </button>

          <button @click="cancelFileUpload"
            class="px-4 py-2 bg-red-500 text-white font-bold rounded-lg">
            Cancelar
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const message = ref<string>("");
const chatHistory = ref<Message[]>([]);
const loading = ref<boolean>(false);
const selectedFile = ref<File | null>(null);
const showFileInput = ref<boolean>(false);

// Enviar mensaje de texto
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

// Mostrar u ocultar el menú de archivos
const toggleFileUpload = () => {
  showFileInput.value = !showFileInput.value;
};

// Manejo de archivos
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFile.value = target.files[0];
  }
};

// Cancelar subida de archivo
const cancelFileUpload = () => {
  selectedFile.value = null;
  showFileInput.value = false;
};

// Subir archivo y enviarlo a la IA
const sendFile = async () => {
  if (!selectedFile.value) return;

  loading.value = true;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    chatHistory.value.push({ sender: "bot", text: `IA: ${data.response}` });
  } catch (error) {
    chatHistory.value.push({ sender: "bot", text: "Error al procesar el archivo." });
  } finally {
    loading.value = false;
    showFileInput.value = false;
    selectedFile.value = null;
  }
};
</script>
