<template>
  <div class="form-fila1">
    <div class="campos-verticales">
      <div class="campo">
        <label>Nombre:</label>
        <input type="text" v-model="local.nombre" @input="emitirCambio" />
      </div>

      <div class="campo">
        <label>Comentarios:</label>
        <textarea v-model="local.comentarios" @input="emitirCambio"></textarea>
      </div>

      <div class="grid-campos">
        <div class="campo">
          <label>Monto:</label>
          <input
            type="number"
            v-model.number="local.monto"
            @input="emitirCambio"
          />
        </div>

        <div class="campo">
          <label>Fecha de Postulación:</label>
          <input
            type="date"
            v-model="local.fecha_postulacion"
            @input="emitirCambio"
          />
        </div>

        <div class="campo">
          <label>Convocatoria:</label>
          <select v-model="local.id_convocatoria" @change="emitirCambio">
            <option value="">Seleccione una convocatoria</option>
            <option
              v-for="convocatoria in convocatorias"
              :key="convocatoria.id"
              :value="convocatoria.id"
            >
              {{ convocatoria.convocatoria }} ({{ convocatoria.tipo }} -
              {{ convocatoria.institucion }})
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Temática:</label>
          <select v-model="local.id_tematica" @change="emitirCambio">
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

        <div class="campo">
          <label>Estatus:</label>
          <select v-model="local.id_estatus" @change="emitirCambio">
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

        <div class="campo">
          <label>Unidad Académica:</label>
          <select v-model="local.id_unidad" @change="emitirCambio">
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

        <div class="campo">
          <label>Apoyo:</label>
          <select v-model="local.id_apoyo" @change="emitirCambio">
            <option value="">Seleccione un apoyo</option>
            <option
              v-for="apoyo in apoyos"
              :key="apoyo.id_apoyo"
              :value="apoyo.id_apoyo"
            >
              {{ apoyo.tipo + ' - ' + apoyo.detalle }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Académicos:</label>
          <div class="academicos-container">
            <div v-for="(academicoId, index) in local.academicos" :key="index" class="academico-item">
              <select v-model="local.academicos[index]" @change="emitirCambio">
                <option value="">Seleccione un académico</option>
                <option
                  v-for="academico in academicos"
                  :key="academico.id_academico"
                  :value="academico.id_academico"
                >
                 {{ academico.a_paterno ? academico.nombre + ' ' + academico.a_paterno : academico.nombre }}

                </option>
              </select>
              <button 
                type="button" 
                @click="eliminarAcademico(index)" 
                class="btn-eliminar"
                :disabled="local.academicos.length <= 1"
              >
                ×
              </button>
            </div>
            <button type="button" @click="agregarAcademico" class="btn-agregar">
              + Añadir otro académico
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchTematicas,
  fetchEstatus,
  fetchConvocatorias,
  fetchUA,
  fetchApoyos,
  fetchAcademicos
} from "../plugins/useSistemaData.js";

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
        academicos: this.proyecto.academicos || [""] // Array de IDs de académicos
      },
      convocatorias: [],
      tematicas: [],
      estatusList: [],
      uaList: [],
      apoyos: [],
      academicos: []
    };
  },
  async created() {
    try {
      const [temas, estatus, convocs, ua, apoyo, academicos] = await Promise.all([
        fetchTematicas(),
        fetchEstatus(),
        fetchConvocatorias(),
        fetchUA(),
        fetchApoyos(),
        fetchAcademicos()
      ]);

      this.tematicas = temas.data || temas;
      this.estatusList = estatus.data || estatus;
      this.convocatorias = convocs.data || convocs;
      this.uaList = ua.data || ua;
      this.apoyos = apoyo.data || apoyo;
      this.academicos = academicos.data || academicos;
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  },
  methods: {
    agregarAcademico() {
      this.local.academicos.push(""); // Agrega un nuevo campo vacío
      this.emitirCambio();
      console.log("Nuevo académico agregado:", this.proyecto);
    },
    eliminarAcademico(index) {
      if (this.local.academicos.length > 1) {
        this.local.academicos.splice(index, 1);
        this.emitirCambio();
      }
    },
    emitirCambio() {
      this.$emit("actualizar", this.local);
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
          academicos: nuevo.academicos || [""]
        };
      },
      deep: true,
    },
  },
  
};
</script>

<style scoped>
.form-fila1 {
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

.campos-verticales {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.grid-campos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
  width: 100%;
}

.campo {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #222;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #fff;
  box-sizing: border-box;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.academicos-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.academico-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.academico-item select {
  flex: 1;
}

.btn-eliminar {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-eliminar:hover {
  background: #cc0000;
}

.btn-eliminar:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.btn-agregar {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.btn-agregar:hover {
  background: #388E3C;
}

@media (max-width: 768px) {
  .grid-campos {
    grid-template-columns: 1fr;
  }
  
  .form-fila1 {
    padding: 0.5rem;
  }
  
  .academico-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-eliminar {
    width: 100%;
  }
}
</style>