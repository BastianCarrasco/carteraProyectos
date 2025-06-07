const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS_EDIT;



export async function deleteProyecto(id_proyecto) {
  try {
    const response = await fetch(`${proyectosUrl}/${id_proyecto}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  } catch (err) {
    console.error(`Error al eliminar PROYECTO con ID ${id}:`, err);
    throw err;
  }
}

//export async function updateTematica(id, tematicaActualizada) {
//   try {
//     const response = await fetch(`${tematicaUrl}/${id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(tematicaActualizada),
//     });

//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     const data = await response.json();
//     return data;
//   } catch (err) {
//     console.error(`Error al actualizar temática con ID ${id}:`, err);
//     throw err;
//   }
// }

export default {

  deleteProyecto,
}