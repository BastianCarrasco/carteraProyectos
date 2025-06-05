<script>
import Fila1 from './Fila1.vue'
import Fila3 from './Fila3.vue'

export default {
  name: 'CreateView',
  components: { Fila1, Fila3 },
  data() {
    return {
      proyecto: {
      
        nombre: '',
        monto: null,
        fecha_postulacion: '',
        comentarios: '',
        id_unidad: null,    // Cambiado de 'unidad' a 'id_unidad'
        id_convocatoria: null,  // Nuevo campo (antes convo_nombre)
        id_tematica: null,  // Nuevo campo (antes tematica)
        id_apoyo: null,     // Nuevo campo (antes tipo_apoyo)
        id_estatus: null,   // Nuevo campo (antes estatus)
        id_kth: null        // Nuevo campo
        // Eliminados: jefe, academico, detalle, tipo_convo, inst_convo
      }
    }
  },
  methods: {
    actualizarProyecto(nuevoDato) {
      this.proyecto = { ...this.proyecto, ...nuevoDato }
    }
  }
}
</script>

<template>
  <div class="create-view">
    <div class="columnas-container">
      <div class="columna-grande">
        <Fila1 :proyecto="proyecto" @actualizar="actualizarProyecto" />
      </div>
      <div class="columna-pequena">
        <Fila3 :proyecto="proyecto" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.columnas-container {
  display: flex;
  height: 100%;
  gap: 20px;
}

.columna-grande {
  flex: 2.5;
  border: 1px solid #ddd;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.columna-pequena {
  flex: 1.5;
  border: 1px solid #ddd;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .columnas-container {
    flex-direction: column;
  }
  
  .columna-grande, .columna-pequena {
    flex: none;
    width: 100%;
  }
}
</style>