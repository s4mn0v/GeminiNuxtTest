import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.GEMINI_API_KEY;

  if (!apiKey) {
    return { error: "API Key no encontrada. Verifica tu .env y nuxt.config.ts" };
  }

  const body = await readBody(event);
  if (!body || !body.message) {
    return { error: "Debes enviar un mensaje en la petición." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ⚠️ Asegurar que la IA responda en español
    const prompt = `Por favor, responde en español. ${body.message}`;

    const chat = await model.generateContent(prompt);
    const response = await chat.response.text(); 

    return { response };
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    return { error: "Error al procesar la solicitud a Gemini." };
  }
});