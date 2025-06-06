const tematicaUrl = import.meta.env.VITE_API_URL_ALLTEMATICAS;

export async function postTematicas(nuevaTematica) {
  try {
    const response = await fetch(tematicaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaTematica),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error al crear temática:", err);
    throw err;
  }
}

export async function deleteTematica(id) {
  try {
    const response = await fetch(`${tematicaUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  } catch (err) {
    console.error(`Error al eliminar temática con ID ${id}:`, err);
    throw err;
  }
}

export async function updateTematica(id, tematicaActualizada) {
  try {
    const response = await fetch(`${tematicaUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tematicaActualizada),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error al actualizar temática con ID ${id}:`, err);
    throw err;
  }
}

export default {
  postTematicas,
  deleteTematica,
  updateTematica

}