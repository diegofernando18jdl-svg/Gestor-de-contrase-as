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
  const apiKey = window.VITE_GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY');
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const systemPrompt = `Recibirás un texto desordenado con credenciales. Extrae cada cuenta y devuelve EXCLUSIVAMENTE un array JSON válido con esta estructura exacta: [{ "servicio": "", "usuario": "", "password": "" }]. Si un servicio solo tiene un 'Token' (como LocalXpose), asígnalo al campo 'password' y deja 'usuario' como un string vacío. Prohibido incluir texto conversacional antes o después del JSON.`;

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
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al conectar con la API de Groq');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    // Depuración en consola
    console.log("Respuesta de la IA (Raw):", resultText);

    // Limpieza extrema con regex para extraer solo el bloque del arreglo
    const match = resultText.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("La IA no devolvió un formato JSON válido.");
    
    const jsonLimpio = match[0];
    
    return JSON.parse(jsonLimpio);
  } catch (error) {
    console.error('Groq Text Service Error:', error);
    throw error;
  }
};

