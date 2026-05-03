/**
 * Servicio para la extracción de credenciales desde imágenes (PDFs procesados)
 * utilizando el modelo de visión de Groq.
 */

export const extraerCredencialesDeImagen = async (base64Image) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  // System Prompt estricto para asegurar el formato de salida
  const systemPrompt = `Prohibido conversar. Devolver ÚNICAMENTE un arreglo en formato JSON con la estructura: [{ "servicio": "", "usuario": "", "password": "" }].`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae las credenciales presentes en esta imagen.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al conectar con la API de Groq');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    // Retornamos el JSON parseado directamente
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Groq Service Error:', error);
    throw error;
  }
};
