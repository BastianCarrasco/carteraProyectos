<template>
  <div class="contenedor">
    <div class="columna-izquierda">
      <button class="boton" @click="mostrarEditor">
        Abrir Editor de Temáticas
      </button>
    </div>
    <div class="columna-derecha">
      <TematicasEditor v-if="mostrarModuloEditor" />
    </div>
  </div>
</template>

<script>
import TematicasEditor from "../components/tematicas/TematicasEditor.vue";

export default {
  components: {
    TematicasEditor,
  },
  data() {
    return {
      mostrarModuloEditor: false,
    };
  },
  methods: {
    mostrarEditor() {
      this.mostrarModuloEditor = true;
    },
  },
};
</script>

<style scoped>
.contenedor {
  display: grid;
  grid-template-columns: 1fr 5fr;
  max-width: 100%;
  height: 100vh;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
}

.columna-izquierda {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}

/* Estilo general para todos los botones */
.boton {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.boton:hover {
  background-color: #0056b3;
  transform: scale(1.03);
}

.boton:active {
  background-color: #004494;
  transform: scale(0.98);
}

.columna-derecha {
  border-left: 1px solid #ccc;
  padding-left: 1rem;
}
</style>
