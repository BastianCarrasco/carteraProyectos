<template>
  <div class="project-form">
    <h1>Crear Nuevo Proyecto</h1>

    <form @submit.prevent="submitProject">
      <div class="form-group">
        <label for="nombre">Nombre del Proyecto:</label>
        <input type="text" id="nombre" v-model="formData.nombre" required>
      </div>

      <div class="form-group">
        <label for="monto">Monto ($):</label>
        <input type="number" id="monto" v-model="formData.monto" required>
      </div>

      <div class="form-group">
        <label for="fecha_postulacion">Fecha de Postulación:</label>
        <input type="date" id="fecha_postulacion" v-model="formData.fecha_postulacion" required>
      </div>

      <div class="form-group">
        <label for="comentarios">Comentarios:</label>
        <textarea id="comentarios" v-model="formData.comentarios"></textarea>
      </div>

      <div class="form-group">
        <label for="unidad">Unidad Académica:</label>
        <select id="unidad" v-model="formData.unidad" required>
          <option value="">Seleccione una unidad</option>
          <option v-for="unidad in unidades" :key="unidad.id_unidad" :value="unidad.id_unidad">
            {{ unidad.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="convocatoria">Convocatoria:</label>
        <select id="convocatoria" v-model="formData.id_convocatoria" required>
          <option value="">Seleccione una convocatoria</option>
          <option v-for="conv in convocatorias" :key="conv.id" :value="conv.id">
            {{ conv.convocatoria }} ({{ conv.institucion }})
          </option>
        </select>
      </div>

      <button type="submit" :disabled="loadingSubmit">
        {{ loadingSubmit ? 'Enviando...' : 'Crear Proyecto' }}
      </button>

      <div v-if="submitMessage" :class="['message', submitSuccess ? 'success' : 'error']">
        {{ submitMessage }}
      </div>
    </form>
  </div>
</template>

<script>
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
        monto: null,
        fecha_postulacion: '',
        comentarios: '',
        unidad: '',
        id_convocatoria: ''
      },
      loadingSubmit: false,
      submitMessage: '',
      submitSuccess: false
    }
  },
  async created() {
    await this.fetchInitialData();
  },
  methods: {
    async fetchInitialData() {
      this.loading = true;
      try {
        // Obtener unidades académicas
        const [resUA, resConv] = await Promise.all([
          fetch('https://kth2025backend-production.up.railway.app/ua'),
          fetch('https://kth2025backend-production.up.railway.app/convocatorias')
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

    async submitProject() {
      this.loadingSubmit = true;
      this.submitMessage = '';

      try {
        // 1. Verifica que todos los campos requeridos estén completos
        if (!this.validateForm()) {
          throw new Error('Por favor complete todos los campos requeridos');
        }

        // 2. URL corregida (verifica la ruta exacta con tu backend)
        const url = 'https://kth2025backend-production.up.railway.app/proyecto';

        // 3. Prepara los datos
        const postData = {
          nombre: this.formData.nombre,
          monto: Number(this.formData.monto),
          fecha_postulacion: this.formData.fecha_postulacion,
          comentarios: this.formData.comentarios,
          unidad: Number(this.formData.unidad),
          id_convocatoria: Number(this.formData.id_convocatoria)
        };

        console.log('Enviando datos:', postData); // Para depuración

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Si necesita autenticación:
            // 'Authorization': 'Bearer ' + tuToken
          },
          body: JSON.stringify(postData)
        });

        // 4. Manejo mejorado de la respuesta
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        // Intenta parsear JSON solo si la respuesta no está vacía
        const contentType = response.headers.get('content-type');
        let result = {};

        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        }

        this.submitSuccess = true;
        this.submitMessage = result.message || 'Proyecto creado exitosamente!';
        this.resetForm();

      } catch (err) {
        console.error('Error completo:', err);
        this.submitSuccess = false;
        this.submitMessage = `Error: ${err.message}`;
      } finally {
        this.loadingSubmit = false;
      }
    },

    validateForm() {
      return (
        this.formData.nombre &&
        this.formData.monto &&
        this.formData.fecha_postulacion &&
        this.formData.unidad &&
        this.formData.id_convocatoria
      );
    },

    resetForm() {
      this.formData = {
        nombre: '',
        monto: null,
        fecha_postulacion: '',
        comentarios: '',
        unidad: '',
        id_convocatoria: ''
      };
    }
  }
}
</script>

<style scoped>
.project-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.error {
  background-color: #f2dede;
  color: #a94442;
}
</style>