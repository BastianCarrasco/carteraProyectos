// plugins/Tags_RUD.js

// Asegúrate de que esta variable de entorno esté configurada correctamente
// en tu archivo .env.local o .env:
// VITE_API_URL_TAGS=https://kth2025backend-production.up.railway.app/tag
const tagsApiUrl = import.meta.env.VITE_API_URL_TAGS;

// --- Función para crear un nuevo Tag (POST) ---
// La función espera un objeto con la propiedad 'tag', por ejemplo: { tag: "Nuevo Tag de Ejemplo" }
export async function postTag(newTagData) {
  try {
    const response = await fetch(tagsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Envía el cuerpo de la solicitud como { tag: "valor_del_tag" }
      body: JSON.stringify(newTagData),
    });

    if (!response.ok) {
      // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`Error al crear tag: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Tag creado exitosamente:", data);
    return data; // Podría devolver el objeto tag creado, incluyendo su id_apoyo
  } catch (err) {
    console.error("Error al crear tag:", err);
    throw err; // Propagar el error para que el componente lo maneje
  }
}

// --- Función para eliminar un Tag (DELETE) ---
// La función espera el id_apoyo del tag a eliminar
export async function deleteTag(id_apoyo) {
  try {
    const response = await fetch(`${tagsApiUrl}/${id_apoyo}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`Error al eliminar tag con ID ${id_apoyo}: ${errorMessage}`);
    }

    console.log(`Tag con ID ${id_apoyo} eliminado exitosamente.`);
    return true; // Indica que la eliminación fue exitosa
  } catch (err) {
    console.error(`Error al eliminar tag con ID ${id_apoyo}:`, err);
    throw err; // Propagar el error para que el componente lo maneje
  }
}

// --- Función para actualizar un Tag (PUT) ---
// Aunque pediste ignorarla por ahora, la incluyo comentada para referencia futura
// Esta función espera el id_apoyo y un objeto con la propiedad 'tag' actualizada
// export async function updateTag(id_apoyo, updatedTagData) {
//   try {
//     const response = await fetch(`${tagsApiUrl}/${id_apoyo}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(updatedTagData), // Espera { tag: "nuevo_valor" }
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => null);
//       const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
//       throw new Error(`Error al actualizar tag con ID ${id_apoyo}: ${errorMessage}`);
//     }

//     const data = await response.json();
//     console.log("Tag actualizado exitosamente:", data);
//     return data;
//   } catch (err) {
//     console.error(`Error al actualizar tag con ID ${id_apoyo}:`, err);
//     throw err;
//   }
// }