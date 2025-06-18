<template>
  <div class="projects-view">
    <h2>Lista de Proyectos</h2>

    <table v-if="proyectos.length" class="proyectos-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Tematica</th>
          <th>Estatus</th>
          <th>Apoyo</th>
          <th>Detalle de Apoyo</th>
          <th>Monto</th>
          <th>Académicos</th>
          <th>Convocatoria</th>
          <th>Fecha Postulación</th>
          <th>Institución</th>
          <th>Comentario</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="proyecto in proyectos" :key="proyecto.id_proyecto" @click="editarProyecto(proyecto)"
          class="fila-proyecto">
          <td>{{ proyecto.nombre }}</td>
          <td>{{ proyecto.tematica }}</td>
          <td>{{ proyecto.estatus }}</td>
          <td>{{ proyecto.apoyo }}</td>
          <td>{{ proyecto.detalle_apoyo }}</td>
          <td>${{ proyecto.monto?.toLocaleString() }}</td>
          <td>
            <ul v-if="getAcademicosForProject(proyecto.id_proyecto).length">
              <li v-for="(profesor, index) in getAcademicosForProject(proyecto.id_proyecto)" :key="index">
                {{ profesor }}
              </li>
            </ul>
            <span v-else>-</span>
          </td>
          <td>{{ proyecto.convocatoria }}</td>
          <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
          <td>{{ proyecto.institucion }}</td>
          <td>{{ proyecto.comentarios }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Cargando proyectos...</p>

    <!-- Modal de edición -->
    <div v-if="proyectoEditando" class="modal-edicion">
      <div class="contenido-modal">
        <h3>Editar Proyecto</h3>

        <form @submit.prevent="guardarCambios">
          <div class="campo-formulario">
            <label>Nombre:</label>
            <input v-model="proyectoEditando.nombre" required>
          </div>

          <div class="campo-formulario">
            <label>Temática:</label>
            <input v-model="proyectoEditando.tematica">
          </div>

          <div class="campo-formulario">
            <label>Estatus:</label>
            <select v-model="proyectoEditando.estatus">
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Postulado">Postulado</option>
            </select>
          </div>

          <div class="campo-formulario">
            <label>Apoyo:</label>
            <input v-model="proyectoEditando.apoyo">
          </div>

          <div class="campo-formulario">
            <label>Detalle de apoyo:</label>
            <input v-model="proyectoEditando.detalle_apoyo">
          </div>

          <div class="campo-formulario">
            <label>Monto:</label>
            <input type="number" v-model.number="proyectoEditando.monto">
          </div>

          <div class="campo-formulario">
            <label>Convocatoria:</label>
            <input v-model="proyectoEditando.convocatoria">
          </div>

          <div class="campo-formulario">
            <label>Fecha Postulación:</label>
            <input type="date" v-model="proyectoEditando.fecha_postulacion">
          </div>

          <div class="campo-formulario">
            <label>Institución:</label>
            <input v-model="proyectoEditando.institucion">
          </div>

          <div class="campo-formulario">
            <label>Comentario:</label>
            <textarea v-model="proyectoEditando.comentarios"></textarea>
          </div>

          <div class="botones-accion">
            <button type="submit" class="boton-guardar">Guardar</button>
            <button type="button" @click="cancelarEdicion" class="boton-cancelar">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const proyectos = ref([]);
const academicosPorProyecto = ref([]);
const proyectoEditando = ref(null);
const url = 'https://elysia-bunbackend-production.up.railway.app/proyectos/data';
const urlAcademicos = 'https://elysia-bunbackend-production.up.railway.app/proyectos/academicosXProyecto';

const formatFecha = (fechaStr) => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CL');
};

const getAcademicosForProject = (idProyecto) => {
  const proyecto = academicosPorProyecto.value.find(p => p.id_proyecto === idProyecto);
  return proyecto ? proyecto.profesores : [];
};

const editarProyecto = (proyecto) => {
  // Hacemos una copia profunda del proyecto para editar
  proyectoEditando.value = JSON.parse(JSON.stringify(proyecto));

  // Convertir la fecha al formato que espera el input type="date"
  if (proyectoEditando.value.fecha_postulacion) {
    const fecha = new Date(proyectoEditando.value.fecha_postulacion);
    proyectoEditando.value.fecha_postulacion = fecha.toISOString().split('T')[0];
  }
};

const guardarCambios = async () => {
  try {
    // Aquí deberías implementar la llamada a tu API para guardar los cambios
    // Por ahora solo actualizamos localmente
    const index = proyectos.value.findIndex(p => p.id_proyecto === proyectoEditando.value.id_proyecto);
    if (index !== -1) {
      proyectos.value[index] = { ...proyectoEditando.value };

      // Convertir la fecha de vuelta al formato original si es necesario
      if (proyectos.value[index].fecha_postulacion) {
        const fecha = new Date(proyectos.value[index].fecha_postulacion);
        proyectos.value[index].fecha_postulacion = fecha.toISOString();
      }
    }

    proyectoEditando.value = null;
    console.log('Cambios guardados');
  } catch (error) {
    console.error('Error al guardar cambios:', error);
  }
};

const cancelarEdicion = () => {
  proyectoEditando.value = null;
};

onMounted(async () => {
  try {
    // Load projects
    const responseProyectos = await fetch(url);
    if (!responseProyectos.ok) throw new Error('Error al obtener proyectos');
    proyectos.value = await responseProyectos.json();

    // Load academics by project
    const responseAcademicos = await fetch(urlAcademicos);
    if (!responseAcademicos.ok) throw new Error('Error al obtener académicos');
    academicosPorProyecto.value = await responseAcademicos.json();

    console.log('✅ Datos cargados:', {
      proyectos: proyectos.value,
      academicos: academicosPorProyecto.value
    });
  } catch (error) {
    console.error('❌ Error al consultar la API:', error.message);
  }
});
</script>

<style scoped>
.projects-view {
  padding: 20px;
  font-family: sans-serif;
  overflow-x: auto;
  position: relative;
}

.proyectos-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.9em;
  min-width: 1200px;
}

.proyectos-table th,
.proyectos-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.proyectos-table th {
  background-color: #f4f4f4;
  position: sticky;
  top: 0;
}

.proyectos-table ul {
  margin: 0;
  padding-left: 20px;
}

.proyectos-table li {
  margin: 2px 0;
  list-style-type: none;
  padding-left: 0;
}

.fila-proyecto {
  cursor: pointer;
  transition: background-color 0.2s;
}

.fila-proyecto:hover {
  background-color: #f0f0f0;
}

/* Estilos para el modal de edición */
.modal-edicion {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.contenido-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.campo-formulario {
  margin-bottom: 15px;
}

.campo-formulario label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.campo-formulario input,
.campo-formulario select,
.campo-formulario textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.campo-formulario textarea {
  min-height: 100px;
}

.botones-accion {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.boton-guardar {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.boton-cancelar {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .projects-view {
    overflow-x: scroll;
  }
}
</style>