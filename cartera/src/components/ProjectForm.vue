<template>
  <div class="project-form">
    <h1>Crear Nuevo Proyecto</h1>

    <form @submit.prevent="submitProject">
      <div class="form-group">
        <label for="nombre">Nombre del Proyecto:</label>
        <input 
          type="text" 
          id="nombre" 
          v-model="formData.nombre" 
          @blur="checkProjectName"
          required
        >
        <div v-if="nameWarning" class="warning-message">
          ⚠ Ya existe un proyecto con este nombre
        </div>
        <div v-if="errors.nombre" class="error-message">
          {{ errors.nombre }}
        </div>
      </div>

      <div class="form-group">
        <label for="monto">Monto ($):</label>
        <input 
          type="number" 
          id="monto" 
          v-model.number="formData.monto" 
          min="0"
          required
        >
        <div v-if="errors.monto" class="error-message">
          {{ errors.monto }}
        </div>
      </div>

      <div class="form-group">
        <label for="fecha_postulacion">Fecha de Postulación:</label>
        <input 
          type="date" 
          id="fecha_postulacion" 
          v-model="formData.fecha_postulacion"
          :max="maxDate"
        >
        <small class="hint">(Opcional)</small>
        <div v-if="errors.fecha_postulacion" class="error-message">
          {{ errors.fecha_postulacion }}
        </div>
      </div>

      <div class="form-group">
        <label for="comentarios">Comentarios:</label>
        <textarea id="comentarios" v-model="formData.comentarios"></textarea>
        <small class="hint">(Opcional)</small>
      </div>

      <div class="form-group">
        <label for="unidad">Unidad Académica:</label>
        <select 
          id="unidad" 
          v-model="formData.unidad" 
          required
        >
          <option value="">Seleccione una unidad</option>
          <option v-for="unidad in unidades" :key="unidad.id_unidad" :value="unidad.id_unidad">
            {{ unidad.nombre }}
          </option>
        </select>
        <div v-if="errors.unidad" class="error-message">
          {{ errors.unidad }}
        </div>
      </div>

      <div class="form-group">
        <label for="convocatoria">Convocatoria:</label>
        <select 
          id="convocatoria" 
          v-model="formData.id_convocatoria"
        >
          <option value="">Seleccione una convocatoria (Opcional)</option>
          <option v-for="conv in convocatorias" :key="conv.id" :value="conv.id">
            {{ conv.convocatoria }} ({{ conv.institucion }})
          </option>
        </select>
      </div>

      <button 
        type="submit" 
        :disabled="loadingSubmit || nameWarning || hasErrors"
        :title="nameWarning ? 'Debe cambiar el nombre del proyecto' : hasErrors ? 'Hay errores en el formulario' : ''"
      >
        {{ loadingSubmit ? 'Enviando...' : 'Crear Proyecto' }}
      </button>

      <div v-if="submitMessage" :class="['message', submitSuccess ? 'success' : 'error']">
        {{ submitMessage }}
      </div>
    </form>
  </div>
</template>

<script>
import '../assets/Proyecto_styles/Form.css'
const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS
const conovocatoriasUrl = import.meta.env.VITE_API_URL_CONVOCATORIAS
const unidadAcesUrl = import.meta.env.VITE_API_URL_UA


export default {
  name: 'ProjectForm',
  data() {
    return {
      unidades: [],
      convocatorias: [],
      loading: false,
      error: null,
      formData: {
        nombre: '',
        monto: 0, // Default value as requested
        fecha_postulacion: null,
        comentarios: '',
        unidad: '',
        id_convocatoria: null
      },
      errors: {
        nombre: '',
        monto: '',
        fecha_postulacion: '',
        unidad: ''
      },
      loadingSubmit: false,
      submitMessage: '',
      submitSuccess: false,
      nameWarning: false,
      checkingName: false
    }
  },
  computed: {
    maxDate() {
      // Set max date to today for the date picker
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    hasErrors() {
      return Object.values(this.errors).some(error => error !== '');
    }
  },
  async created() {
    await this.fetchInitialData();
  },
  methods: {
    async fetchInitialData() {
      this.loading = true;
      try {
        const [resUA, resConv] = await Promise.all([
          fetch(unidadAcesUrl),
          fetch(conovocatoriasUrl)
        ]);

        if (!resUA.ok || !resConv.ok) {
          throw new Error('Error al cargar datos iniciales');
        }

        const dataUA = await resUA.json();
        const dataConv = await resConv.json();

        if (dataUA.success && dataConv.success) {
          this.unidades = dataUA.data;
          this.convocatorias = dataConv.data;
        }
      } catch (err) {
        this.error = err.message;
        console.error('Error:', err);
      } finally {
        this.loading = false;
      }
    },

    validateForm() {
      let isValid = true;
      
      // Reset errors
      this.errors = {
        nombre: '',
        monto: '',
        fecha_postulacion: '',
        unidad: ''
      };

      // Validate project name
      if (!this.formData.nombre.trim()) {
        this.errors.nombre = 'El nombre del proyecto es requerido';
        isValid = false;
      }

      // Validate amount
      if (this.formData.monto === null || this.formData.monto === '') {
        this.errors.monto = 'El monto es requerido';
        isValid = false;
      } else if (isNaN(this.formData.monto)) {
        this.errors.monto = 'El monto debe ser un número válido';
        isValid = false;
      } else if (this.formData.monto < 0) {
        this.errors.monto = 'El monto no puede ser negativo';
        isValid = false;
      }

      // Validate date if provided
      if (this.formData.fecha_postulacion) {
        const inputDate = new Date(this.formData.fecha_postulacion);
        const today = new Date();
        
        if (inputDate > today) {
          this.errors.fecha_postulacion = 'La fecha no puede ser futura';
          isValid = false;
        }
      }

      // Validate academic unit
      if (!this.formData.unidad) {
        this.errors.unidad = 'Debe seleccionar una unidad académica';
        isValid = false;
      }

      return isValid;
    },

    async checkProjectName() {
      if (!this.formData.nombre.trim()) return;
      
      this.checkingName = true;
      try {
        const response = await fetch(`https://kth2025backend-production.up.railway.app/proyecto/check-name?name=${encodeURIComponent(this.formData.nombre)}`);
        
        if (response.ok) {
          const data = await response.json();
          this.nameWarning = data.exists;
        }
      } catch (error) {
        console.error('Error checking project name:', error);
      } finally {
        this.checkingName = false;
      }
    },

    async submitProject() {
      if (!this.validateForm() || this.nameWarning) {
        return;
      }

      this.loadingSubmit = true;
      this.submitMessage = '';

      try {
        const url = proyectosUrl;

        const postData = {
          nombre: this.formData.nombre.trim(),
          monto: Number(this.formData.monto),
          fecha_postulacion: this.formData.fecha_postulacion || null,
          comentarios: this.formData.comentarios.trim() || null,
          unidad: Number(this.formData.unidad),
          id_convocatoria: this.formData.id_convocatoria ? Number(this.formData.id_convocatoria) : null
        };

        console.log('Datos que se enviarán al servidor:', JSON.stringify(postData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        this.submitSuccess = true;
        this.submitMessage = result.message || 'Proyecto creado exitosamente!';
        this.resetForm();

      } catch (err) {
        console.error('Error:', err);
        this.submitSuccess = false;
        this.submitMessage = `Error al crear proyecto: ${err.message}`;
      } finally {
        this.loadingSubmit = false;
      }
    },

    resetForm() {
      this.formData = {
        nombre: '',
        monto: 0,
        fecha_postulacion: null,
        comentarios: '',
        unidad: '',
        id_convocatoria: null
      };
      this.errors = {
        nombre: '',
        monto: '',
        fecha_postulacion: '',
        unidad: ''
      };
      this.nameWarning = false;
    }
  }
}
</script>

<style scoped>
.error-message {
  color: #ff4444;
  font-size: 0.8em;
  margin-top: 5px;
}

.warning-message {
  color: #ffbb33;
  font-size: 0.8em;
  margin-top: 5px;
}

.hint {
  color: #666;
  font-style: italic;
  margin-left: 5px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message.success {
  color: #00C851;
}

.message.error {
  color: #ff4444;
}
</style>