<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content-lg">
      <h3>Editar Proyecto: {{ editedProject?.nombre }}</h3>
      <form @submit.prevent="onSave">
        <!-- Nombre -->
        <div class="modal-form-group">
          <label for="edit-nombre">Nombre:</label>
          <input id="edit-nombre" v-model="editedProject.nombre" required />
        </div>

        <!-- Temática -->
        <div class="modal-form-group">
          <label for="edit-tematica">Temática:</label>
          <select id="edit-tematica" v-model="editedProject.tematica">
            <option v-for="tematica in tematicasOptions" :key="tematica.id_tematica" :value="tematica.id_tematica">
              {{ tematica.nombre }}
            </option>
          </select>
        </div>

        <!-- Estatus -->
        <div class="modal-form-group">
          <label for="edit-estatus">Estatus:</label>
          <select id="edit-estatus" v-model="editedProject.estatus">
            <option v-for="est in estatusOptions" :key="est.id_estatus" :value="est.id_estatus">
              {{ est.tipo }}
            </option>
          </select>
        </div>

        <!-- Apoyo -->
        <div class="modal-form-group">
          <label for="edit-apoyo">Apoyo:</label>
          <select id="edit-apoyo" v-model="editedProject.apoyo">
            <option v-for="apoyo in apoyosOptions" :key="apoyo.id_apoyo" :value="apoyo.id_apoyo">
              {{ apoyo.nombre }}
            </option>
          </select>
        </div>

        <!-- Detalle Apoyo -->
        <div class="modal-form-group">
          <label for="edit-detalle-apoyo">Detalle de Apoyo:</label>
          <input v-model="editedProject.detalle_apoyo" />
        </div>

        <!-- Monto -->
        <div class="modal-form-group">
          <label for="edit-monto">Monto:</label>
          <input id="edit-monto" type="number" v-model.number="editedProject.monto" />
        </div>

        <!-- Convocatoria -->
        <div class="modal-form-group">
          <label for="edit-convocatoria">Convocatoria:</label>
          <input id="edit-convocatoria" v-model="editedProject.convocatoria" />
        </div>

        <!-- Fecha -->
        <div class="modal-form-group">
          <label for="edit-fecha-postulacion">Fecha Postulación:</label>
          <input id="edit-fecha-postulacion" type="date" v-model="editedProject.fecha_postulacion" />
        </div>

        <!-- Comentarios -->
        <div class="modal-form-group">
          <label for="edit-comentarios">Comentario:</label>
          <textarea id="edit-comentarios" v-model="editedProject.comentarios"></textarea>
        </div>

        <div class="modal-actions">
          <button type="submit" class="boton-guardar">Guardar Cambios</button>
          <button type="button" @click="onCancel" class="boton-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  editedProject: Object,
  tematicasOptions: Array,
  estatusOptions: Array,
  apoyosOptions: Array
})

const emit = defineEmits(['save', 'cancel'])

const onSave = () => {
  emit('save')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content-lg {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
}

.modal-form-group {
  margin-bottom: 1rem;
}

.modal-form-group label {
  display: block;
  font-weight: bold;
}

.modal-form-group input,
.modal-form-group select,
.modal-form-group textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.boton-guardar {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}

.boton-cancelar {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}
</style>
