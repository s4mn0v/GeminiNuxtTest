import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key no encontrada. Verifica tu .env y nuxt.config.ts");
    return { error: "API Key no encontrada." };
  }

  const body = await readBody(event);
  if (!body?.message && !body?.image) {
    return { error: "Debes enviar un mensaje o una imagen en la petición." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 📌 Definir estructura del chat
    interface ChatMessage {
      sender: "user" | "bot";
      text: string;
    }

    // 📌 Historial del chat (máximo 5 mensajes)
    const chatHistory: ChatMessage[] = Array.isArray(body.chatHistory) 
      ? body.chatHistory.slice(-5).filter((msg: any): msg is ChatMessage => 
          msg && typeof msg.text === "string" && (msg.sender === "user" || msg.sender === "bot")
        ) 
      : [];

    // 📌 Formatear historial de mensajes
    const lastMessages = chatHistory.map(msg => ({
      text: `${msg.sender === "user" ? "Usuario" : "Bot"}: ${msg.text}`
    }));

    // 📌 Crear prompt para IA
    const inputParts: any[] = [
      {
        text: `Eres un experto en Psicología, Derecho y Matemáticas. Solo responde preguntas relacionadas con estos temas.
               Si te preguntan algo fuera de estos temas, responde: 
               "Lo siento, solo puedo responder preguntas de Psicología, Derecho y Matemáticas."`
      },
      ...lastMessages
    ];

    if (body.message) {
      inputParts.push({ text: `Usuario: ${body.message}` });
    }

    if (body.image) {
      const base64Data = body.image.split(",")[1];

      inputParts.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      });

      if (!body.message) {
        inputParts.push({
          text: "Analiza la imagen y proporciona información relevante dentro de Psicología, Derecho o Matemáticas."
        });
      }
    }

    // 🔥 Enviar a Gemini
    console.log("🚀 Enviando a Gemini:", inputParts);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: inputParts }]
    });

    const responseText =
  result?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(" ") ||
  "No pude generar una respuesta.";

    console.log("✅ Respuesta de Gemini:", responseText);

    return { response: responseText };
  } catch (error) {
    console.error("❌ Error en la API de Gemini:", error);
    return { error: "Error al procesar la solicitud a Gemini." };
  }
});
