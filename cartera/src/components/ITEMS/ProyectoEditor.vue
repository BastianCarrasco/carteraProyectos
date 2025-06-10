<!-- Componente padre (el que muestra la lista y los botones "Editar") -->
<template>
  <div class="columna-derecha">
    <div class="editor-container">
      <div class="filtros">
        <!-- Selector para el nombre del proyecto -->
        <select v-model="filtroNombre" class="input-filtro" @change="seleccionarProyecto">
          <option value="">Seleccione un proyecto</option>
          <option
            v-for="(nombre, index) in nombresProyectosUnicos"
            :key="index"
            :value="nombre"
          >
            {{ nombre }}
          </option>
        </select>
      </div>

      <div class="lista-con-edicion" v-if="proyectoSeleccionado">
        <div class="item-n">
          <div v-if="!proyectoSeleccionado.editando" class="vista-normal">
            <div class="info-proyecto">
              <h3>{{ proyectoSeleccionado.nombre }}</h3>
              <div class="campo-editable">
                <p><strong>Monto:</strong> ${{ formatMonto(proyectoSeleccionado.monto) }}</p>
                <button class="btn-editar" @click="editarCampo('monto')">Editar</button>
              </div>
              <div class="campo-editable">
                <p>
                  <strong>Convocatoria:</strong> {{ proyectoSeleccionado.convo_nombre }}
                  ({{ proyectoSeleccionado.tipo_convo }})
                </p>
                <button class="btn-editar" @click="editarCampo('convocatoria')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Temática:</strong> {{ proyectoSeleccionado.tematica }}</p>
                <button class="btn-editar" @click="editarCampo('tematica')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Estatus:</strong> {{ proyectoSeleccionado.estatus }}</p>
                <button class="btn-editar" @click="editarCampo('estatus')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Académico(s):</strong> {{ academicosUnidos }}</p>
                <button class="btn-editar" @click="editarCampo('academicos')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Unidad Academica:</strong> {{ proyectoSeleccionado.unidad }}</p>
                <button class="btn-editar" @click="editarCampo('unidad')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Detalle:</strong> {{ proyectoSeleccionado.detalle }}</p>
                <button class="btn-editar" @click="editarCampo('detalle')">Editar</button>
              </div>
              <div class="campo-editable">
                <p><strong>Comentario:</strong> {{ proyectoSeleccionado.comentarios }}</p>
                <button class="btn-editar"  @click="editarCampo('comentarios')">Editar</button>
              </div>
            </div>
            <div class="acciones">
              <button @click="eliminarProyecto(proyectoSeleccionado)" class="btn-accion eliminar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edición -->
    <EditarProyectoModal
      :show="showModal"
      :campo-a-editar="campoAEditar"
      :valor-editado="valorEditado"
      :proyecto-seleccionado="proyectoSeleccionado"
      @cerrarModal="cerrarModal"
      @guardarCambioIndividual="guardarCambioIndividual"
    />
  </div>
</template>

<script>
import { deleteProyecto } from "../../plugins/Proyectos_RUD.js";
import { fetchProyectos } from "../../plugins/useSistemaData.js";
import "../../assets/estilosEdit.css";
import "../../assets/Proyecto_styles/editorProyecto.css";
import EditarProyectoModal from "./EditarProyectoModal.vue"; // Importa el componente modal

export default {
  components: {
    EditarProyectoModal, // Registra el componente modal
  },
  data() {
    return {
      proyectos: [],
      filtroNombre: "",
      proyectoSeleccionado: null,
      showModal: false,
      campoAEditar: null,
      valorEditado: "",
      camposEditables: {
        monto: {
          label: "Monto",
          type: "number",
          key: "monto",
        },
        convocatoria: {
          label: "Convocatoria",
          type: "text",
          key: "convo_nombre",
        },
        tematica: {
          label: "Temática",
          type: "text",
          key: "tematica",
        },
        estatus: {
          label: "Estatus",
          type: "select",
          key: "estatus",
          opciones: [
            { label: "Postulado", value: "Postulado" },
            { label: "Aprobado", value: "Aprobado" },
            { label: "Rechazado", value: "Rechazado" },
            { label: "En revisión", value: "En revisión" },
          ],
        },
        academicos: {
          label: "Académicos",
          type: "textarea",
          key: "academico",
        },
        unidad: {
          label: "Unidad Académica",
          type: "text",
          key: "unidad",
        },
        detalle: {
          label: "Detalle",
          type: "textarea",
          key: "detalle",
        },
        comentarios: {
          label: "Comentarios",
          type: "textarea",
          key: "comentarios",
        },
      },
    };
  },

  computed: {
    nombresProyectosUnicos() {
      const set = new Set(this.proyectos.map((p) => p.nombre).filter(Boolean));
      return Array.from(set).sort();
    },

    academicosUnidos() {
      if (!this.proyectoSeleccionado) return "";

      const proyectosMismoNombre = this.proyectos.filter(
        (p) => p.nombre === this.proyectoSeleccionado.nombre
      );

      const academicos = new Set();
      proyectosMismoNombre.forEach((p) => {
        if (p.academico) {
          p.academico.split(",").forEach((acad) => {
            academicos.add(acad.trim());
          });
        }
      });

      return Array.from(academicos).join(", ");
    },
  },

  async created() {
    await this.cargarProyectos();
  },

  methods: {
    formatMonto(monto) {
      return new Intl.NumberFormat("es-CL").format(monto);
    },

    async cargarProyectos() {
      try {
        const data = await fetchProyectos();
        this.proyectos = data.map((p) => ({
          ...p,
          original: { ...p }, // Guarda una copia del objeto original
        }));
      } catch (error) {
        console.error("Error cargando proyectos:", error);
        alert("Error al cargar los proyectos.");
      }
    },

    seleccionarProyecto() {
      if (!this.filtroNombre) {
        this.proyectoSeleccionado = null;
        return;
      }

      const proyecto = this.proyectos.find((p) => p.nombre === this.filtroNombre);
      if (proyecto) {
        this.proyectoSeleccionado = JSON.parse(JSON.stringify(proyecto));
      } else {
        this.proyectoSeleccionado = null;
      }
    },

    editarCampo(campo) {
      this.campoAEditar = this.camposEditables[campo];
      if (this.campoAEditar) {
        // Carga el valor actual en el modal
        this.valorEditado = this.proyectoSeleccionado[this.campoAEditar.key] || "";
        this.showModal = true;
      }
    },

    cerrarModal() {
      this.showModal = false;
      this.campoAEditar = null;
      this.valorEditado = "";
    },

    async guardarCambioIndividual(nuevoValor) {
      if (!this.campoAEditar || !this.proyectoSeleccionado) return;

      try {
          this.proyectoSeleccionado[this.campoAEditar.key] = nuevoValor;

          // Guarda los cambios en el backend (simulado)
          // **Aquí deberías agregar la lógica para enviar la información al servidor**
          console.log("Guardando cambio:", this.campoAEditar.key, "con valor:", nuevoValor);
          
          //Recarga la lista de proyectos para actualizar la vista
          await this.cargarProyectos();
          this.seleccionarProyecto();

          this.cerrarModal();
      } catch (error) {
          console.error("Error al guardar el cambio:", error);
          alert("Error al guardar el cambio.");
      }
    },

    async eliminarProyecto(proyecto) {
      if (confirm(`¿Eliminar el proyecto "${proyecto.nombre}" y todas sus variantes?`)) {
        try {
          // Implementa la lógica de eliminación aquí usando el ID del proyecto
          await deleteProyecto(proyecto.id_proyecto);
          alert("Proyecto eliminado con éxito.");
          await this.cargarProyectos();
          this.proyectoSeleccionado = null;
          this.filtroNombre = "";
        } catch (error) {
          console.error("Error eliminando:", error);
          alert("Error al eliminar el proyecto.");
        }
      }
    },
  },
};
</script>

<style scoped>
.campo-editable {
  display: flex;
  align-items: center;
  gap: 8px;
}

.campo-editable button {
  order: -1; /* Mueve el botón al principio */
}

.btn-editar{
  padding: 8px 12px;
  border: solid;
  border-radius: 4px;
  background-color: rgb(255, 225, 0);
  color: rgb(0, 0, 0);
  font-size:medium;
  border-style:groove;

}
/* Tus estilos existentes pueden permanecer igual */
</style>