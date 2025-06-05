// src/composables/useSistemaData.js

const estatusUrl = import.meta.env.VITE_API_URL_ESTATUS;
const apoyoUrl = import.meta.env.VITE_API_URL_ALLAPOYO;
const tematicaUrl = import.meta.env.VITE_API_URL_ALLTEMATICAS;
const convocatoriasUrl = import.meta.env.VITE_API_URL_CONVOCATORIAS;
const academicosUrl= import.meta.env.VITE_API_URL_ACADEMICOS; 
const UAURL = import.meta.env.VITE_API_URL_UA;

export async function fetchTematicas() {
  try {
    const response = await fetch(tematicaUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.error('Error al cargar temáticas:', err);
    throw err;
  }
}

export async function fetchApoyos() {
  try {
    const response = await fetch(apoyoUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.error('Error al cargar apoyos:', err);
    throw err;
  }
}

export async function fetchEstatus() {
  try {
    const response = await fetch(estatusUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    return await response.json(); // incluye success y data
  } catch (err) {
    console.error('Error al cargar estatus:', err);
    throw err;
  }
}

export async function fetchConvocatorias() {
  try {
    const response = await fetch(convocatoriasUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.error('Error al cargar convocatorias:', err);
    throw err;
  }
}

export async function fetchAcademicos() {
  try {
    const response = await fetch(academicosUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.error('Error al cargar académicos:', err);
    throw err;
  }
}

export async function fetchUA() {
  try {
    const response = await fetch(UAURL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    console.error('Error al cargar UA:', err);
    throw err;
  }
}

export default {
  fetchTematicas, 
  fetchApoyos,
  fetchEstatus,
  fetchConvocatorias,
  fetchAcademicos,
  fetchUA
};
