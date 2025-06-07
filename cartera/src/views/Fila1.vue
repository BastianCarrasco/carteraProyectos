<template>
  <div class="form-container">
    <div class="form-header">
      <h2>Información del Proyecto</h2>
    </div>

    <div class="form-body">
      <!-- Sección principal -->
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">Nombre del Proyecto:</label>
          <input 
            type="text" 
            v-model="local.nombre" 
            @input="emitirCambio" 
            class="form-input"
            placeholder="Ingrese el nombre del proyecto"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Comentarios:</label>
          <textarea 
            v-model="local.comentarios" 
            @input="emitirCambio" 
            class="form-textarea"
            placeholder="Agregue comentarios relevantes"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Sección de grid -->
      <div class="form-grid">
        <!-- Columna 1 -->
        <div class="form-column">
          <div class="form-group">
            <label class="form-label">Monto:</label>
            <input 
              type="number" 
              v-model.number="local.monto" 
              @input="emitirCambio" 
              class="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Postulación:</label>
            <input 
              type="date" 
              v-model="local.fecha_postulacion" 
              @input="emitirCambio" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Convocatoria:</label>
            <select 
              v-model="local.id_convocatoria" 
              @change="emitirCambio" 
              class="form-select"
            >
              <option value="">Seleccione una convocatoria</option>
              <option 
                v-for="convocatoria in convocatorias" 
                :key="convocatoria.id" 
                :value="convocatoria.id"
              >
                {{ convocatoria.convocatoria }} ({{ convocatoria.tipo }} - {{ convocatoria.institucion }})
              </option>
            </select>
          </div>
        </div>

        <!-- Columna 2 -->
        <div class="form-column">
          <div class="form-group">
            <label class="form-label">Temática:</label>
            <select 
              v-model="local.id_tematica" 
              @change="emitirCambio" 
              class="form-select"
            >
              <option value="">Seleccione una temática</option>
              <option 
                v-for="tematica in tematicas" 
                :key="tematica.id_tematica" 
                :value="tematica.id_tematica"
              >
                {{ tematica.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Estatus:</label>
            <select 
              v-model="local.id_estatus" 
              @change="emitirCambio" 
              class="form-select"
            >
              <option value="">Seleccione un estatus</option>
              <option 
                v-for="estatus in estatusList" 
                :key="estatus.id_estatus" 
                :value="estatus.id_estatus"
              >
                {{ estatus.tipo }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Unidad Académica:</label>
            <select 
              v-model="local.id_unidad" 
              @change="emitirCambio" 
              class="form-select"
            >
              <option value="">Seleccione una Unidad</option>
              <option 
                v-for="ua in uaList" 
                :key="ua.id_unidad" 
                :value="ua.id_unidad"
              >
                {{ ua.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Columna 3 -->
        <div class="form-column">
          <div class="form-group">
            <label class="form-label">Tipo de Apoyo:</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="local.id_apoyo" 
                  :value="1" 
                  @change="handleApoyoChange(1)" 
                  class="radio-input"
                />
                <span class="radio-label">Total</span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="local.id_apoyo" 
                  :value="2" 
                  @change="handleApoyoChange(2)" 
                  class="radio-input"
                />
                <span class="radio-label">Parcial</span>
              </label>
            </div>
            <div v-if="local.id_apoyo === 2 && apoyoSeleccionado" class="apoyo-seleccionado">
              <strong>Opciones seleccionadas:</strong> {{ apoyoSeleccionado.detalle }}
              <button @click="abrirModal" class="btn-editar">Editar</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Académicos:</label>
            <div class="academicos-list">
              <div v-for="(academicoId, index) in local.academicos" :key="index" class="academico-item">
                <select 
                  v-model="local.academicos[index]" 
                  @change="emitirCambio" 
                  class="form-select academico-select"
                >
                  <option value="">Seleccione un académico</option>
                  <option 
                    v-for="academico in academicos" 
                    :key="academico.id_academico" 
                    :value="academico.id_academico"
                  >
                    {{ academico.a_paterno ? `${academico.nombre} ${academico.a_paterno}` : academico.nombre }}
                  </option>
                </select>
                <button 
                  @click="eliminarAcademico(index)" 
                  class="btn-eliminar"
                  :disabled="local.academicos.length <= 1"
                  title="Eliminar académico"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <button @click="agregarAcademico" class="btn-agregar">
                <i class="fas fa-plus"></i> Añadir académico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para selección de tags de apoyo parcial -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Seleccione las opciones de apoyo parcial</h3>
          <button @click="cerrarModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tags-container">
            <div 
              v-for="tag in tagsDisponibles" 
              :key="tag.id_apoyo" 
              class="tag-option"
              @click="toggleTag(tag.tag)"
              :class="{ selected: tagsSeleccionados.includes(tag.tag) }"
            >
              {{ tag.tag }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="confirmarTags" class="btn-confirmar">
            <i class="fas fa-check"></i> Confirmar selección
          </button>
          <button @click="cerrarModal" class="btn-cancelar">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchTematicas, fetchEstatus, fetchConvocatorias, fetchUA, fetchApoyos, fetchAcademicos } from "../plugins/useSistemaData.js";
import '../assets/Proyecto_styles/Fila1.css';
export default {
  name: "Fila1",
  props: ["proyecto"],
  data() {
    return {
      local: {
        ...this.proyecto,
        id_convocatoria: this.proyecto.id_convocatoria || "",
        id_tematica: this.proyecto.id_tematica || "",
        id_estatus: this.proyecto.id_estatus || "",
        id_unidad: this.proyecto.id_unidad || "",
        id_apoyo: this.proyecto.id_apoyo || "",
        academicos: this.proyecto.academicos || [""],
        
      },
      convocatorias: [],
      tematicas: [],
      estatusList: [],
      uaList: [],
      apoyos: [],
      academicos: [],
      mostrarModal: false,
      tagsDisponibles: [],
      tagsSeleccionados: [],
      apoyoSeleccionado: null
    };
  },
  async created() {
    try {
      const [temas, estatus, convocs, ua, apoyo, acads] = await Promise.all([
        fetchTematicas(),
        fetchEstatus(),
        fetchConvocatorias(),
        fetchUA(),
        fetchApoyos(),
        fetchAcademicos(),
      ]);
      this.tematicas = temas.data || temas;
      this.estatusList = estatus.data || estatus;
      this.convocatorias = convocs.data || convocs;
      this.uaList = ua.data || ua;
      this.apoyos = apoyo.data || apoyo;
      this.academicos = acads.data || acads;
      
      // Si ya hay un apoyo parcial seleccionado, cargar sus datos
      if (this.local.id_apoyo && this.local.id_apoyo !== 1) {
        this.cargarApoyoExistente();
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  },
  methods: {
    agregarAcademico() {
      this.local.academicos.push("");
      this.emitirCambio();
    },
    eliminarAcademico(index) {
      if (this.local.academicos.length > 1) {
        this.local.academicos.splice(index, 1);
        this.emitirCambio();
      }
    },
   emitirCambio() {
  const datosConTags = {
    ...this.local,
    tags_parciales: this.tagsSeleccionados
  };
  this.$emit("actualizar", datosConTags);
}
,
    async handleApoyoChange(tipo) {
      if (tipo === 1) {
        // Apoyo total
        this.local.id_apoyo = 1;
        this.apoyoSeleccionado = null;
        this.emitirCambio();
      } else {
        // Apoyo parcial - abrir modal para selección
        await this.cargarTags();
        this.mostrarModal = true;
      }
    },
    async cargarTags() {
      try {
        const res = await fetch("https://kth2025backend-production.up.railway.app/tag");
        const data = await res.json();
        this.tagsDisponibles = data.data || [];
      } catch (error) {
        console.error("Error cargando tags:", error);
      }
    },
    async cargarApoyoExistente() {
      try {
        const res = await fetch(`https://kth2025backend-production.up.railway.app/apoyos/${this.local.id_apoyo}`);
        const data = await res.json();
        if (data.success) {
          this.apoyoSeleccionado = data.data;
          this.tagsSeleccionados = data.data.detalle.split(", ");
        }
      } catch (error) {
        console.error("Error cargando apoyo existente:", error);
      }
    },
    toggleTag(tag) {
      const index = this.tagsSeleccionados.indexOf(tag);
      if (index === -1) {
        this.tagsSeleccionados.push(tag);
      } else {
        this.tagsSeleccionados.splice(index, 1);
      }
    },
    abrirModal() {
      this.mostrarModal = true;
    },
    cerrarModal() {
      this.mostrarModal = false;
    },
    async confirmarTags() {
      if (this.tagsSeleccionados.length === 0) {
        alert("Por favor seleccione al menos una opción de apoyo parcial");
        return;
      }
      
      const detalle = this.tagsSeleccionados.join(", ");
      const payload = { tipo: 2, detalle };

      try {
        const res = await fetch("https://kth2025backend-production.up.railway.app/crearApoyo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          this.local.id_apoyo = data.data.id_apoyo;
          this.apoyoSeleccionado = data.data;
          this.mostrarModal = false;
          this.emitirCambio();
        } else {
          console.error("Error en respuesta al crear apoyo parcial");
        }
      } catch (error) {
        console.error("Error al crear apoyo parcial:", error);
      }
    },
  },
  watch: {
    proyecto: {
      handler(nuevo) {
        this.local = {
          ...nuevo,
          id_convocatoria: nuevo.id_convocatoria || "",
          id_tematica: nuevo.id_tematica || "",
          id_estatus: nuevo.id_estatus || "",
          id_unidad: nuevo.id_unidad || "",
          id_apoyo: nuevo.id_apoyo || "",
          academicos: nuevo.academicos || [""],
        };
        
        // Si hay un apoyo parcial, cargar sus datos
        if (this.local.id_apoyo && this.local.id_apoyo !== 1) {
          this.cargarApoyoExistente();
        } else {
          this.apoyoSeleccionado = null;
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>

</style>