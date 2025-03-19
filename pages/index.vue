<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="w-10/10 h-[95vh] bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-xl font-bold text-center mb-4 text-gray-700">Prueba consultorio</h1>

      <!-- Contenedor del chat -->
      <div class="h-5/6 overflow-y-auto border p-3 rounded-lg bg-gray-50">
        <div v-for="(msg, index) in chatHistory" :key="index" class="mb-3 flex flex-col"
          :class="msg.sender === 'user' ? 'items-end' : 'items-start'">

          <!-- ✅ Mostrar imagen si el mensaje tiene una -->
          <div v-if="msg.image" class="mb-1">
            <img :src="msg.image" alt="Imagen enviada" class="w-32 h-32 rounded-lg border shadow-md" />
          </div>

          <!-- ✅ Mostrar mensaje de texto -->
          <p v-if="msg.text" class="p-2 rounded-lg max-w-xs"
            :class="msg.sender === 'user' ? 'bg-blue-500 text-yellow-200' : 'bg-gray-300 text-gray-900'">
            {{ msg.text }}
          </p>
        </div>
      </div>

      <!-- ✅ Entrada de mensajes con vista previa de imagen -->
      <div class="mt-4 flex items-center relative">
        <!-- 📷 Vista previa de imagen antes de enviarla -->
        <div v-if="imageBase64" class="mr-2 relative">
          <img :src="imageBase64" alt="Vista previa" class="w-12 h-12 rounded-lg border shadow-md" />
          <button @click="removeImage"
            class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1">✖</button>
        </div>

        <input v-model="message" @keydown.enter="sendMessage"
          class="flex-1 p-3 h-12 border rounded-lg text-gray-700 pr-12"
          placeholder="Escribe un mensaje..." />

        <!-- 📷 Botón para subir imágenes -->
        <label class="ml-2 px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-lg cursor-pointer">
          📷
          <input type="file" @change="handleImageUpload" accept="image/png, image/jpeg" class="hidden" />
        </label>

        <button @click="sendMessage" :disabled="loading"
          class="ml-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg">
          {{ loading ? "..." : "Enviar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// ✅ Definimos la estructura de los mensajes
interface Message {
  sender: "user" | "bot";
  text: string;
  image?: string;
}

const message = ref<string>("");
const chatHistory = ref<Message[]>([]);
const loading = ref<boolean>(false);
const imageBase64 = ref<string | null>(null);

// ✅ Manejo de imágenes (mostrar en la entrada antes de enviar)
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // 🔥 Validamos que el tamaño sea menor a 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("El archivo es demasiado grande (máx. 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64.value = reader.result as string;
    };

    reader.readAsDataURL(file);
  }
};

// ✅ Eliminar imagen antes de enviarla
const removeImage = () => {
  imageBase64.value = null;
};

// ✅ Enviar mensaje o imagen
const sendMessage = async () => {
  if (!message.value.trim() && !imageBase64.value) return;

  chatHistory.value.push({ sender: "user", text: message.value, image: imageBase64.value || undefined });

  loading.value = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.value, image: imageBase64.value })
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
    imageBase64.value = null;
  }
};
</script>
