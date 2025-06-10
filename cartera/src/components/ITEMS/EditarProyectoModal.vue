<!-- Componente Modal (EditarProyectoModal.vue) -->
<template>
  <div class="modal" :class="{ 'is-active': show }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Editar {{ campoAEditar ? campoAEditar.label : '' }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="campoAEditar">
          <!-- Campos de entrada basados en el campo a editar -->
          <div v-if="campoAEditar.type === 'text'" class="field">
            <label class="label">{{ campoAEditar.label }}</label>
            <input
              class="input"
              type="text"
              v-model="localValorEditado"
              :placeholder="campoAEditar.label"
            />
          </div>
          <div v-else-if="campoAEditar.type === 'number'" class="field">
            <label class="label">{{ campoAEditar.label }}</label>
            <input class="input" type="number" v-model.number="localValorEditado" />
          </div>
          <div v-else-if="campoAEditar.type === 'textarea'" class="field">
            <label class="label">{{ campoAEditar.label }}</label>
            <textarea class="textarea" v-model="localValorEditado"></textarea>
          </div>
          <div v-else-if="campoAEditar.type === 'select'" class="field">
            <label class="label">{{ campoAEditar.label }}</label>
            <select class="input" v-model="localValorEditado">
              <option v-for="opcion in campoAEditar.opciones" :key="opcion.value" :value="opcion.value">
                {{ opcion.label }}
              </option>
            </select>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="guardarCambio" :disabled="!campoAEditar">
          Guardar
        </button>
        <button class="button" @click="cerrarModal">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    campoAEditar: {
      type: Object,
      default: null,
    },
    valorEditado: {
      type: [String, Number], // Permite tanto String como Number
      default: "",
    },
    proyectoSeleccionado: { // Recibe el proyecto seleccionado (por referencia)
      type: Object,
      required: false, // Cambiado a false porque no siempre se provee
    },
  },
  data() {
    return {
      localValorEditado: this.valorEditado, // Inicializa con el valor recibido
    };
  },
  watch: {
    valorEditado(newValue) {
      this.localValorEditado = newValue; // Actualiza el valor local cuando cambia la prop
    },
    show(newValue) {
        if(!newValue) {
            this.localValorEditado = this.valorEditado; //Resetea el valor cuando se cierra el modal
        }
    }
  },
  methods: {
    cerrarModal() {
      this.$emit("cerrarModal");
      this.localValorEditado = this.valorEditado; //Reestablece el valor local al cerrar
    },
    guardarCambio() {
      this.$emit("guardarCambioIndividual", this.localValorEditado);
    },
  },
};
</script>

<style scoped>
/* Tus estilos existentes pueden permanecer igual */
/* Estilos para el modal (los mismos que antes) */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semi-transparente */
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10; /* Asegura que esté por encima de otros elementos */
}

.modal.is-active {
  display: flex;
}

.modal-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 80%; /* Ajusta el ancho según tus necesidades */
  max-width: 600px;
  position: relative;
}

.modal-card-head,
.modal-card-foot {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-card-body {
  padding: 1rem;
}

.modal-card-foot {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
}

.field {
  margin-bottom: 1rem;
}

.label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

.input,
.textarea,
.select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  margin-left: 0.5rem;
}

.button:hover {
  opacity: 0.8;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>