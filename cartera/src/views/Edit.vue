<template>
  <div class="projects-view">
    <h2>Lista de Proyectos</h2>

    <table v-if="proyectos.length" class="proyectos-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Monto</th>
          <th>Fecha Postulación</th>
          <th>Tematica</th>
          <th>Estatus</th>
          <th>Convocatoria</th>
          <th>Institución</th>
          <th>Detalle de Apoyo</th>
          <th>Apoyo</th>
          <th>Comentario</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="proyecto in proyectos" :key="proyecto.id_proyecto">
          <td>{{ proyecto.id_proyecto }}</td>
          <td>{{ proyecto.nombre }}</td>
          <td>${{ proyecto.monto.toLocaleString() }}</td>
          <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
          <td>{{ proyecto.tematica }}</td>
          <td>{{ proyecto.estatus }}</td>
          <td>{{ proyecto.convocatoria }}</td>
          <td>{{ proyecto.institucion }}</td>
          <td>{{ proyecto.detalle_apoyo }}</td>
          <td>{{ proyecto.apoyo }}</td>
          <td>{{ proyecto.comentarios }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Cargando proyectos...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const proyectos = ref([]);
const url = 'https://elysia-bunbackend-production.up.railway.app/proyectos/data';
const urlacademicos = 'https://elysia-bunbackend-production.up.railway.app/academicos';

const formatFecha = (fechaStr) => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CL');
};

onMounted(async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener datos del backend');
    }
    const data = await response.json();
    proyectos.value = data;
    console.log('✅ Datos cargados:', data);
  } catch (error) {
    console.error('❌ Error al consultar la API:', error.message);
  }
});
</script>

<style scoped>
.projects-view {
  padding: 20px;
  font-family: sans-serif;
}

.proyectos-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.proyectos-table th,
.proyectos-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.proyectos-table th {
  background-color: #f4f4f4;
}
</style>
