import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key no encontrada. Verifica tu .env y nuxt.config.ts");
    return { error: "API Key no encontrada." };
  }

  const body = await readBody(event);
  if (!body?.message) {
    return { error: "Debes enviar un mensaje en la petición." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 🔹 Instrucción para que solo responda sobre Psicología
    const prompt = `
      Eres un experto en Psicología. Solo responde preguntas relacionadas con Psicología. 
      Si te preguntan algo que no tenga que ver con Psicología, responde: "Lo siento, solo puedo responder preguntas de Psicología."
      
      Pregunta del estudiante: ${body.message}
    `;

    const result = await model.generateContent(prompt);

    // 📌 Accediendo correctamente a la respuesta
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ") || "No pude generar una respuesta.";

    return { response: responseText };
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    return { error: "Error al procesar la solicitud a Gemini." };
  }
});
