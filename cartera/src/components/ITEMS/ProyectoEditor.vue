<template>
  <div class="columna-derecha">
    <div class="editor-container">
      <div class="filtros">
        <!-- Selector para el nombre del proyecto -->
        <select v-model="filtroNombre" class="input-filtro">
          <option value="">Todos los proyectos</option>
          <option
            v-for="(nombre, index) in nombresProyectosUnicos"
            :key="index"
            :value="nombre"
          >
            {{ nombre }}
          </option>
        </select>

        <!-- Selector para el académico (este se mantiene igual) -->
        <select v-model="filtroAcademico" class="input-filtro">
          <option value="">Todos los académicos</option>
          <option
            v-for="(acad, index) in academicosUnicos"
            :key="index"
            :value="acad"
          >
            {{ acad }}
          </option>
        </select>
      
      </div>

      <div class="lista-con-edicion">
        <div
          v-for="proyecto in proyectosFiltrados"
          :key="proyecto.id_proyecto"
          class="item-n"
        >
          <div v-if="!proyecto.editando" class="vista-normal">
            <div class="info-proyecto">
              <h3>{{ proyecto.nombre }}</h3>

              <p><strong>Monto:</strong> ${{ formatMonto(proyecto.monto) }}</p>
              <p>
                <strong>Convocatoria:</strong> {{ proyecto.convo_nombre }} ({{
                  proyecto.tipo_convo
                }})
              </p>
              <p><strong>Temática:</strong> {{ proyecto.tematica }}</p>
              <p><strong>Estatus:</strong> {{ proyecto.estatus }}</p>
              <p><strong>Académico:</strong> {{ proyecto.academico }}</p>
              <p><strong>Unidad Academica:</strong> {{ proyecto.unidad }}</p>
              <p><strong>Detalle:</strong> {{ proyecto.detalle }}</p>
              <p><strong>Comentario:</strong> {{ proyecto.comentarios }}</p>
            </div>
            <div class="acciones">
              <button
                @click="editarProyecto(proyecto)"
                class="btn-accion editar"
              >
                Editar
              </button>
              <button
                @click="eliminarProyecto(proyecto)"
                class="btn-accion eliminar"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div v-else class="vista-edicion">
            <div class="formulario-edicion">
              <div class="campo">
                <label>Nombre:</label>
                <input v-model="proyecto.nombreEditado" class="input-edicion" />
              </div>
              <div class="campo">
                <label>Monto:</label>
                <input
                  v-model="proyecto.montoEditado"
                  type="number"
                  class="input-edicion"
                />
              </div>
              <div class="campo">
                <label>Fecha Postulación:</label>
                <input
                  v-model="proyecto.fecha_postulacionEditado"
                  type="date"
                  class="input-edicion"
                />
              </div>
              <div class="campo">
                <label>Unidad:</label>
                <input v-model="proyecto.unidadEditado" class="input-edicion" />
              </div>
              <div class="campo">
                <label>Convocatoria:</label>
                <input
                  v-model="proyecto.convo_nombreEditado"
                  class="input-edicion"
                />
              </div>
              <div class="campo">
                <label>Tipo Convocatoria:</label>
                <select
                  v-model="proyecto.tipo_convoEditado"
                  class="input-edicion"
                >
                  <option value="PRIVADA">Privada</option>
                  <option value="PUBLICA">Pública</option>
                </select>
              </div>
              <div class="campo">
                <label>Institución:</label>
                <input
                  v-model="proyecto.inst_convoEditado"
                  class="input-edicion"
                />
              </div>
              <div class="campo">
                <label>Temática:</label>
                <input
                  v-model="proyecto.tematicaEditado"
                  class="input-edicion"
                />
              </div>
              <div class="campo">
                <label>Tipo Apoyo:</label>
                <select
                  v-model="proyecto.tipo_apoyoEditado"
                  class="input-edicion"
                >
                  <option value="Parcial">Parcial</option>
                  <option value="Total">Total</option>
                </select>
              </div>
              <div class="campo">
                <label>Detalle:</label>
                <textarea
                  v-model="proyecto.detalleEditado"
                  class="input-edicion"
                ></textarea>
              </div>
              <div class="campo">
                <label>Estatus:</label>
                <select v-model="proyecto.estatusEditado" class="input-edicion">
                  <option value="Postulado">Postulado</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="En revisión">En revisión</option>
                </select>
              </div>
              <div class="campo">
                <label>Académico:</label>
                <input
                  v-model="proyecto.academicoEditado"
                  class="input-edicion"
                />
              </div>
            </div>
            <div class="acciones">
              <button
                @click="guardarCambios(proyecto)"
                class="btn-accion guardar"
              >
                Guardar
              </button>
              <button
                @click="cancelarEdicion(proyecto)"
                class="btn-accion cancelar"
              >
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
import { deleteProyecto } from "../../plugins/Proyectos_RUD.js";
import { fetchProyectos } from "../../plugins/useSistemaData.js";
import "../../assets/estilosEdit.css";

export default {
  data() {
    return {
      proyectos: [],
      // filtroNombre ahora se usará con un select, por lo que su valor inicial puede ser una cadena vacía
      filtroNombre: "",
      filtroAcademico: "",
    };
  },

  computed: {
    proyectosFiltrados() {
      // Función para normalizar el texto (quitar acentos, convertir a minúsculas, etc.)
      const normalizarTexto = (texto) => {
        if (!texto) return "";
        return texto
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };

      // Aquí, nombreBuscado será el nombre completo seleccionado del dropdown
      const nombreBuscado = this.filtroNombre;
      const academicoBuscado = normalizarTexto(this.filtroAcademico).trim();

      console.log("Filtro Nombre (seleccionado):", `"${nombreBuscado}"`);
      console.log("Filtro Académico (normalizado):", `"${academicoBuscado}"`);

      return this.proyectos.filter((proyecto) => {
        const nombreProyecto = proyecto.nombre; // Aquí usamos el nombre original para la coincidencia exacta
        const academicoProyecto = normalizarTexto(proyecto.academico);

        // Filtro por nombre: Coincidencia exacta con el nombre seleccionado (si hay uno)
        const coincideNombre = nombreBuscado === "" || nombreProyecto === nombreBuscado;

        // Filtro por académico (se mantiene como includes por si quieres buscar subcadenas en el futuro, aunque con select exacto es más común)
        const coincideAcademico = academicoBuscado === "" || academicoProyecto.includes(academicoBuscado);

        return coincideNombre && coincideAcademico;
      });
    },
    academicosUnicos() {
      const set = new Set(
        this.proyectos.map((p) => p.academico).filter(Boolean)
      );
      return Array.from(set).sort();
    },
    // Nueva computed property para nombres de proyectos únicos
    nombresProyectosUnicos() {
      const set = new Set(
        this.proyectos.map((p) => p.nombre).filter(Boolean)
      );
      return Array.from(set).sort();
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
          editando: false,
          nombreEditado: p.nombre,
          montoEditado: p.monto,
          fecha_postulacionEditado: p.fecha_postulacion,
          unidadEditado: p.unidad,
          convo_nombreEditado: p.convo_nombre,
          tipo_convoEditado: p.tipo_convo,
          inst_convoEditado: p.inst_convo,
          tematicaEditado: p.tematica,
          tipo_apoyoEditado: p.tipo_apoyo,
          detalleEditado: p.detalle,
          estatusEditado: p.estatus,
          academicoEditado: p.academico,
          original: { ...p },
        }));
        this.resetFiltros();
      } catch (error) {
        console.error("Error cargando proyectos:", error);
        alert("Error al cargar los proyectos.");
      }
    },


    editarProyecto(proyecto) {
      proyecto.editando = true;
      Object.keys(proyecto).forEach((key) => {
        if (key.endsWith("Editado")) {
          const originalKey = key.replace("Editado", "");
          proyecto[key] = proyecto[originalKey];
        }
      });
    },

    async guardarCambios(proyecto) {
      try {
        const payload = {
          nombre: proyecto.nombreEditado,
          monto: proyecto.montoEditado,
          fecha_postulacion: proyecto.fecha_postulacionEditado,
          unidad: proyecto.unidadEditado,
          convo_nombre: proyecto.convo_nombreEditado,
          tipo_convo: proyecto.tipo_convoEditado,
          inst_convo: proyecto.inst_convoEditado,
          tematica: proyecto.tematicaEditado,
          tipo_apoyo: proyecto.tipo_apoyoEditado,
          detalle: proyecto.detalleEditado,
          estatus: proyecto.estatusEditado,
          academico: proyecto.academicoEditado,
          jefe: proyecto.jefe,
        };

        if (proyecto.esNuevo) {
          await postProyecto(payload);
          alert("Proyecto creado con éxito.");
          await this.cargarProyectos();
        } else {
          await updateProyecto(proyecto.id_proyecto, payload);
          alert("Proyecto actualizado con éxito.");

          Object.keys(payload).forEach((key) => {
            proyecto[key] = payload[key];
            const editKey = `${key}Editado`;
            if (proyecto[editKey] !== undefined) {
              proyecto[editKey] = payload[key];
            }
          });
          proyecto.original = { ...proyecto };
        }

        proyecto.editando = false;
        delete proyecto.esNuevo;
      } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error al guardar los cambios.");
      }
    },

    cancelarEdicion(proyecto) {
      if (proyecto.esNuevo) {
        this.proyectos = this.proyectos.filter(
          (p) => p.id_proyecto !== proyecto.id_proyecto
        );
      } else {
        Object.keys(proyecto.original).forEach((key) => {
          proyecto[key] = proyecto.original[key];
          const editKey = `${key}Editado`;
          if (proyecto[editKey] !== undefined) {
            proyecto[editKey] = proyecto.original[key];
          }
        });
        proyecto.editando = false;
      }
    },

    async eliminarProyecto(proyecto) {
      if (confirm(`¿Eliminar el proyecto "${proyecto.nombre}"?`)) {
        try {
          if (!proyecto.esNuevo) {
            await deleteProyecto(proyecto.id_proyecto);
            alert("Proyecto eliminado con éxito.");
          }
          this.proyectos = this.proyectos.filter(
            (p) => p.id_proyecto !== proyecto.id_proyecto
          );
        } catch (error) {
          console.error("Error eliminando:", error);
          alert("Error al eliminar el proyecto.");
        }
      }
    },
    resetFiltros() {
      this.filtroNombre = "";
      this.filtroAcademico = "";
    },
  },
};
</script>

<style scoped>
.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.input-filtro {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.lista-con-edicion {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.item-n {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.vista-normal,
.vista-edicion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-proyecto {
  flex-grow: 1;
}

.info-proyecto h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.info-proyecto p {
  margin: 5px 0;
  color: #555;
  font-size: 0.95em;
}

.acciones {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
}

.btn-accion {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.btn-accion.editar {
  background-color: #007bff;
  color: white;
}

.btn-accion.editar:hover {
  background-color: #0056b3;
}

.btn-accion.guardar {
  background-color: #28a745;
  color: white;
}

.btn-accion.guardar:hover {
  background-color: #218838;
}

.btn-accion.cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-accion.cancelar:hover {
  background-color: #5a6268;
}

.formulario-edicion {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
}

.campo {
  display: flex;
  flex-direction: column;
}

.campo label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
  font-size: 0.9em;
}

.input-edicion {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

textarea.input-edicion {
  min-height: 80px;
  resize: vertical;
}

@media (max-width: 768px) {
  .formulario-edicion {
    grid-template-columns: 1fr;
  }
}
</style>