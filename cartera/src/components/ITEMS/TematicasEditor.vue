<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-content">
      <h3>Agregar Nueva Temática</h3>
      <input v-model="nuevaTematica" placeholder="Nombre de la temática" />
      <div class="modal-actions">
        <button @click="guardarTematica">Guardar</button>
        <button @click="$emit('cerrar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const nuevaTematica = ref('');

const guardarTematica = async () => {
  if (!nuevaTematica.value.trim()) return;

  await fetch('https://elysia-bunbackend-production.up.railway.app/tematicas/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: nuevaTematica.value }),
  });

  nuevaTematica.value = '';
  // Emitir evento para que el padre recargue la lista
  emit('tematica-agregada');
  emit('cerrar');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  margin: 100px auto;
  width: 300px;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>
