export async function analyzeAudio(
  file: File
) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(
    'https://chord-analyzer-api-b3q9.onrender.com',
    {
      method: 'POST',
      body: formData
    }
  );

  return await response.json();
}