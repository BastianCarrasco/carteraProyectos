<template>
  <div class="columna-derecha">
    <div class="editor-container">
      <div class="tags-description">
        <h3 class="tags-title">Tags:</h3>
        <p class="tags-text">
          Los tags son atributos que describen un apoyo parcial, permitiendo categorizar sus características mediante opciones predefinidas.
          Para ver su uso, diríjase a la vista "Crear Proyecto" y seleccione "Parcial" en el campo "Tipo de Apoyo".
        </p>
      </div>
      <div class="acciones-superiores">
        <button @click="nuevoTag" class="btn-nuevo">
          + Nuevo Tag
        </button>

       
      </div>

      <div class="lista-con-edicion">
        <div v-for="tag in tags" :key="tag.id_apoyo" class="item-n">
          <!-- Vista normal del tag (cuando no se está editando) -->
          <div v-if="!tag.editando" class="vista-normal">
            <span>{{ tag.tag }}</span>
            <div class="acciones">
              <!-- Reintroducimos el botón de Eliminar -->
              <button @click="eliminarTag(tag)" class="btn-accion eliminar">
                Eliminar
              </button>
              <!-- Puedes añadir un botón de editar aquí si también quieres esa funcionalidad -->
              <!-- <button @click="editarTag(tag)" class="btn-accion editar">
                Editar
              </button> -->
            </div>
          </div>

          <!-- Vista de edición (solo para tags nuevos, ya que update no está disponible) -->
          <div v-else class="vista-edicion">
            <input v-model="tag.tagEditado" class="input-edicion" />
            <div class="acciones">
              <button @click="guardarCambios(tag)" class="btn-accion guardar">
                Guardar
              </button>
              <button @click="cancelarEdicion(tag)" class="btn-accion cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchTags } from "../../plugins/useSistemaData.js";
import { postTag, deleteTag } from "../../plugins/Apoyos_RUD.js"; // Asegúrate de que este sea el path correcto

import '../../assets/estilosEdit.css';

export default {
  data() {
    return {
      tags: [],
    };
  },
  async created() {
    await this.cargarTags();
  },
  methods: {
    async cargarTags() {
      try {
        const data = await fetchTags();
        this.tags = data.map((t) => ({
          ...t, // Mantén todas las propiedades originales (id_apoyo, tag)
          editando: false, // Por defecto, ningún tag está en modo edición
          tagEditado: t.tag, // Valor para el input de edición
          original: { ...t }, // Copia del original para cancelar cambios
        }));
      } catch (error) {
        console.error("Error cargando tags:", error);
        alert("Error al cargar los tags.");
      }
    },

    nuevoTag() {
      const nuevo = {
        // Usamos un ID temporal negativo para diferenciarlo de los IDs de la DB
        // y para asegurar que sea único en la lista de la UI.
        id_apoyo: `nuevo-${Date.now()}`,
        tag: "", // Empieza con un string vacío para que el usuario escriba
        tagEditado: "",
        editando: true, // Ponerlo en modo edición inmediatamente
        esNuevo: true, // Bandera para saber que es un nuevo registro
      };
      this.tags.unshift(nuevo); // Añade el nuevo tag al principio de la lista
    },

    // Esta función solo activaría el modo edición, pero como no hay `updateTag`
    // podríamos quitarla o dejarla sin uso por ahora, si el único `editando`
    // es para `esNueva`.
    // Si la dejamos, el botón "Editar" en la plantilla también debería estar.
    editarTag(tag) {
      // Si decidimos no tener edición para tags existentes por ahora
      // (ya que no hay `updateTag` implementado), esta función no hará nada.
      // Si la necesitamos, descomentaríamos el botón en el template.
      // tag.editando = true;
      // tag.tagEditado = tag.tag;
      alert("La edición directa de tags existentes no está implementada aún.");
    },

    async guardarCambios(tag) {
      if (tag.esNuevo) {
        if (!tag.tagEditado.trim()) {
          alert("El nombre del tag no puede estar vacío.");
          return;
        }
        try {
          // Llama a la función postTag del archivo Apoyos_RUD.js
          const response = await postTag({ tag: tag.tagEditado });
          alert("Tag creado con éxito.");
          // Recargamos todos los tags para obtener el ID real y las nuevas adiciones
          await this.cargarTags();
        } catch (error) {
          console.error("Error guardando nuevo tag:", error);
          alert("Error al guardar el nuevo tag.");
        }
      }
      // No hay lógica para actualizar tags existentes aquí porque updateTag no está implementado
      // Si updateTag estuviera, se manejaría aquí con un else.
    },

    cancelarEdicion(tag) {
      if (tag.esNuevo) {
        // Si es un tag nuevo y se cancela, simplemente lo quitamos de la lista
        this.tags = this.tags.filter((t) => t.id_apoyo !== tag.id_apoyo);
      } else {
        // Si no es un tag nuevo (es decir, existente y quizás queríamos editarlo),
        // restauramos su estado original y salimos del modo edición.
        // Esto sería relevante si la función `editarTag` estuviera activa.
        tag.tagEditado = tag.original.tag;
        tag.editando = false;
      }
    },

    async eliminarTag(tag) {
      if (confirm(`¿Estás seguro de que quieres eliminar el tag "${tag.tag}"?`)) {
        try {
          // Solo intentamos eliminar del backend si el tag no es uno recién agregado
          // que todavía no se ha guardado (ya que no tiene un ID de DB).
          if (!tag.esNuevo) {
            await deleteTag(tag.id_apoyo); // Llama a la función deleteTag
            alert("Tag eliminado con éxito.");
          }
          // Filtra el tag eliminado de la lista de la UI
          this.tags = this.tags.filter((t) => t.id_apoyo !== tag.id_apoyo);
        } catch (error) {
          console.error("Error eliminando tag:", error);
          alert("Error al eliminar el tag.");
        }
      }
    },
  },
};
</script>

<style scoped>
.lista-con-edicion {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
}

.item-n {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  word-break: break-word;
}

.vista-normal,
.vista-edicion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-edicion {
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn-accion {
  padding: 4px 8px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-accion.eliminar {
  background-color: #e74c3c;
  color: white;
}

.btn-accion.guardar {
  background-color: #2ecc71;
  color: white;
}

.btn-accion.cancelar {
  background-color: #95a5a6;
  color: white;
}

.btn-nuevo {
  margin-bottom: 16px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

</style>