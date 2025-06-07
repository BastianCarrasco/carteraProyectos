<template>
  <div class="columna-derecha">
    <div class="editor-container">

      <div class="acciones-superiores">
        <button @click="nuevaTematica" class="btn-nuevo">
          + Nueva Temática
        </button>
      </div>

      <div class="lista-con-edicion">
        <div
          v-for="tematica in tematicas"
          :key="tematica.id_tematica"
          class="item-n"
        >
          <div v-if="!tematica.editando" class="vista-normal">
            <span>{{ tematica.nombre }}</span>
            <div class="acciones">
              <button @click="editarTematica(tematica)" class="btn-accion editar">
                Editar
              </button>
              <button @click="eliminarTematica(tematica)" class="btn-accion eliminar">
                Eliminar
              </button>
            </div>
          </div>

          <div v-else class="vista-edicion">
            <input v-model="tematica.nombreEditado" class="input-edicion" />
            <div class="acciones">
              <button @click="guardarCambios(tematica)" class="btn-accion guardar">
                Guardar
              </button>
              <button @click="cancelarEdicion(tematica)" class="btn-accion cancelar">
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
import { fetchTematicas } from "../../plugins/useSistemaData.js";
import {
  postTematicas,
  updateTematica,
  deleteTematica,
} from "../../plugins/Tematicas_RUD.js";
import '../../assets/estilosEdit.css'

export default {
  data() {
    return {
      tematicas: [],
    };
  },
  async created() {
    await this.cargarTematicas();
  },
  methods: {
    async cargarTematicas() {
      try {
        const data = await fetchTematicas();
        this.tematicas = data.map((t) => ({
          ...t,
          editando: false,
          nombreEditado: t.nombre,
          original: { ...t },
        }));
      } catch (error) {
        console.error("Error cargando temáticas:", error);
        alert("Error al cargar las temáticas.");
      }
    },

    nuevaTematica() {
      const nueva = {
        id_tematica: Date.now().toString(),
        nombre: "Nueva temática",
        nombreEditado: "Nueva temática",
        editando: true,
        esNueva: true,
      };
      this.tematicas.unshift(nueva);
    },

    editarTematica(tematica) {
      tematica.editando = true;
      tematica.nombreEditado = tematica.nombre;
    },

    async guardarCambios(tematica) {
      try {
        const payload = { nombre: tematica.nombreEditado };

        if (tematica.esNueva) {
          await postTematicas(payload);
          alert("Temática creada con éxito.");
          await this.cargarTematicas();
        } else {
          await updateTematica(tematica.id_tematica, payload);
          alert("Temática actualizada con éxito.");
          tematica.nombre = tematica.nombreEditado;
          tematica.editando = false;
          tematica.original = { ...tematica };
        }

        if (!tematica.esNueva) {
          tematica.editando = false;
          delete tematica.esNueva;
        }
      } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error al guardar los cambios.");
      }
    },

    cancelarEdicion(tematica) {
      if (tematica.esNueva) {
        this.tematicas = this.tematicas.filter(
          (t) => t.id_tematica !== tematica.id_tematica
        );
      } else {
        tematica.nombreEditado = tematica.original.nombre;
        tematica.editando = false;
      }
    },

    async eliminarTematica(tematica) {
      if (confirm(`¿Eliminar "${tematica.nombre}"?`)) {
        try {
          if (!tematica.esNueva) {
            await deleteTematica(tematica.id_tematica);
            alert("Temática eliminada con éxito.");
          }
          this.tematicas = this.tematicas.filter(
            (t) => t.id_tematica !== tematica.id_tematica
          );
        } catch (error) {
          console.error("Error eliminando:", error);
          alert("Error al eliminar la temática.");
        }
      }
    },
  },
};
</script>

<style scoped>

.lista-con-edicion {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Fuerza 3 columnas fijas */
  gap: 20px;
  width: 100%;
}



</style>
