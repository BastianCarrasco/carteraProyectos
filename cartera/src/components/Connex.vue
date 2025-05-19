<template>
  <div class="projects-container">
    <h1 class="title">🔗 Conectar Proyectos con Académicos</h1>

    <div class="card">
      <div class="form-section">
        <div class="select-group">
          <label>📁 Proyecto</label>
          <select v-model="selectedProyecto" @change="resetConnection">
            <option disabled value="">Seleccione un proyecto</option>
            <option v-for="proyecto in proyectosUnicos" :key="proyecto.id_proyecto" :value="proyecto.id_proyecto">
              {{ proyecto.nombre }} ({{ proyecto.id_proyecto }})
            </option>
          </select>
        </div>

        <div class="connection-animation" v-if="showArrow">
          <div class="connection-visualization">
            <span class="icon">📋</span>
            <span class="arrow">➡️</span>
            <span class="icon" v-if="esJefe">👑</span>
            <span class="icon">👨‍🏫</span>
          </div>
        </div>

        <div class="select-group">
          <label>👨‍🏫 Académico</label>
          <select v-model="selectedAcademico" @change="resetConnection">
            <option disabled value="">Seleccione un académico</option>
            <option v-for="academico in academicosUnicos" :key="academico.id_academico" :value="academico.id_academico">
              {{ academico.nombre }} {{ academico.apellido }} ({{ academico.id_academico }})
            </option>
          </select>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="esJefe" @change="resetConnection" />
            👑 ¿Es jefe de proyecto?
          </label>
        </div>

        <button class="submit-btn" :disabled="!selectedProyecto || !selectedAcademico" @click="crearConexion">
          🚀 Crear Conexión
        </button>
      </div>

      <transition name="fade">
        <div v-if="message" class="message" :class="{ success: isSuccess, error: !isSuccess }">
          {{ message }}
        </div>
      </transition>
    </div>
  </div>
</template>


<script>

export default {
  name: 'ProjectsView',
  data() {
    return {
      proyectos: [],
      academicos: [],
      selectedProyecto: '',
      selectedAcademico: '',
      esJefe: false,
      message: '',
      isSuccess: false,
      showArrow: false
    }
  },
  computed: {
    // Filtra proyectos únicos por id_proyecto
    proyectosUnicos() {
      const seen = new Set();
      return this.proyectos.filter(proyecto => {
        const duplicate = seen.has(proyecto.id_proyecto);
        seen.add(proyecto.id_proyecto);
        return !duplicate;
      });
    },
    // Filtra académicos únicos por id_academico
    academicosUnicos() {
      const seen = new Set();
      return this.academicos.filter(academico => {
        const duplicate = seen.has(academico.id_academico);
        seen.add(academico.id_academico);
        return !duplicate;
      });
    }
  },
  watch: {
    selectedProyecto(newVal) {
      this.checkSelection();
    },
    selectedAcademico(newVal) {
      this.checkSelection();
    }
  },
  async created() {
    await this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      try {
        // Obtener datos de proyectos
        const proyectosResponse = await fetch('https://kth2025backend-production.up.railway.app/proyectos');
        const proyectosData = await proyectosResponse.json();
        this.proyectos = proyectosData.data;

        // Obtener datos de académicos
        const academicosResponse = await fetch('https://kth2025backend-production.up.railway.app/academicos');
        const academicosData = await academicosResponse.json();
        this.academicos = academicosData.data;

      } catch (error) {
        console.error('Error al obtener los datos:', error);
        this.mostrarMensaje('Error al cargar los datos', false);
      }
    },
    checkSelection() {
      this.showArrow = this.selectedProyecto && this.selectedAcademico;
    },
    resetConnection() {
      this.showArrow = false;
      setTimeout(() => {
        this.checkSelection();
      }, 50);
    },
    async crearConexion() {
      try {
        const response = await fetch('https://kth2025backend-production.up.railway.app/proyecto-academico', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_proyecto: this.selectedProyecto,
            id_academico: this.selectedAcademico,
            jefe: this.esJefe ? 1 : 0
          })
        });

        if (response.ok) {
          const data = await response.json();
          this.mostrarMensaje('Conexión creada exitosamente', true);
          console.log('Conexión creada:', data);
          // Limpiar selección
          this.selectedProyecto = '';
          this.selectedAcademico = '';
          this.esJefe = false;
          this.showArrow = false;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear la conexión');
        }
      } catch (error) {
        console.error('Error al crear la conexión:', error);
        this.mostrarMensaje(error.message, false);
      }
    },
    mostrarMensaje(msg, success) {
      this.message = msg;
      this.isSuccess = success;
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }
}
</script>

<style scoped>

.projects-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 1rem;
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.card {
  background: #fff;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.select-group {
  text-align: left;
}

.select-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}

select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.checkbox-group {
  text-align: left;
  margin-top: -1rem;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.connection-animation {
  display: flex;
  justify-content: center;
  align-items: center;
}

.connection-visualization {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 2rem;
}

.message {
  margin-top: 1.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: bold;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


</style>