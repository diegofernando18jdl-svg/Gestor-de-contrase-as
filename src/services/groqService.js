/**
 * Servicio para la extracción de credenciales desde imágenes (PDFs procesados)
 * utilizando el modelo de visión de Groq.
 */

export const extraerCredencialesDeImagen = async (base64Image) => {
  // ... (código existente)
};

/**
 * Nueva función para extraer credenciales desde bloques de texto desordenado.
 * Utiliza un modelo de texto de alta capacidad.
 */
export const extraerCredencialesDeTexto = async (textoPuro) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const systemPrompt = `Recibirás un texto desordenado con credenciales. Extrae cada cuenta y devuelve ÚNICAMENTE un arreglo en formato JSON válido con esta estructura exacta: [{ "servicio": "", "usuario": "", "password": "" }]. Prohibido incluir texto conversacional antes o después del JSON.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textoPuro }
        ],
        temperature: 0.1 // Baja temperatura para mayor precisión en el formato
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al conectar con la API de Groq');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    // Limpieza de posibles backticks de markdown si la IA los incluye
    const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Groq Text Service Error:', error);
    throw error;
  }
};

