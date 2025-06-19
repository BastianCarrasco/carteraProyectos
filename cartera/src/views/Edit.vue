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
          <th>Unidad</th>
          <th>Convocatoria</th>
          <th>Fecha Postulación</th>
          <th>Institución</th>
          <th>Comentario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="proyecto in proyectos" :key="proyecto.id_proyecto"
          :class="{ 'fila-proyecto': true, 'fila-editando': editingRowId === proyecto.id_proyecto }">
          <!-- Nombre -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.nombre }}</span>
            <input v-else v-model="editedProject.nombre" required>
          </td>
          <!-- Tematica -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.tematica }}</span>
            <input v-else v-model="editedProject.tematica">
          </td>
          <!-- Estatus -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ getEstatusNombre(proyecto.estatus) }}</span>
            <select v-else v-model="editedProject.estatus">
              <option v-for="est in estatusOptions" :key="est.id_estatus" :value="est.id_estatus">
                {{ est.tipo }}
              </option>
            </select>
          </td>
          <!-- Apoyo -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ getApoyoNombre(proyecto.apoyo) }}</span>
            <select v-else v-model="editedProject.apoyo">
              <option v-for="apoyo in apoyosOptions" :key="apoyo.id_apoyo" :value="apoyo.id_apoyo">
                {{ apoyo.nombre }}
              </option>
            </select>
          </td>
          <!-- Detalle de Apoyo -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.detalle_apoyo }}</span>
            <input v-else v-model="editedProject.detalle_apoyo">
          </td>
          <!-- Monto -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">${{ proyecto.monto?.toLocaleString() }}</span>
            <input v-else type="number" v-model.number="editedProject.monto">
          </td>
          <!-- Académicos -->
          <td>
            <ul v-if="getAcademicosForProject(proyecto.id_proyecto).length">
              <li v-for="(profesor, index) in getAcademicosForProject(proyecto.id_proyecto)" :key="index">
                {{ profesor }}
              </li>
            </ul>
            <span v-else>-</span>
          </td>
          <!-- Unidad -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.unidad }}</span>
            <div v-else class="unidad-select-group">
              <select v-model="editedProject.selectedParentUnitId" @change="loadSubUnitsForEdit"
                class="parent-unit-select">
                <option value="">Seleccione una unidad padre</option>
                <option v-for="unidad in unidadesPadre" :key="unidad.id_unidad" :value="unidad.id_unidad">
                  {{ unidad.nombre }}
                </option>
              </select>
              <select v-if="currentSubUnits.length > 0" v-model="editedProject.unidad" class="sub-unit-select">
                <option value="">Seleccione una sub-unidad</option>
                <option v-for="sub in currentSubUnits" :key="sub.id_unidad" :value="sub.nombre">
                  {{ sub.nombre }}
                </option>
              </select>
            </div>
          </td>
          <!-- Convocatoria -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.convocatoria }}</span>
            <input v-else v-model="editedProject.convocatoria">
          </td>
          <!-- Fecha Postulación -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ formatFecha(proyecto.fecha_postulacion) }}</span>
            <input v-else type="date" v-model="editedProject.fecha_postulacion">
          </td>
          <!-- Institución -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ getInstitucionNombre(proyecto.institucion) }}</span>
            <select v-else v-model="editedProject.institucion">
              <option v-for="inst in institucionesOptions" :key="inst.id" :value="inst.id">
                {{ inst.nombre }}
              </option>
            </select>
          </td>
          <!-- Comentario -->
          <td>
            <span v-if="editingRowId !== proyecto.id_proyecto">{{ proyecto.comentarios }}</span>
            <textarea v-else v-model="editedProject.comentarios"></textarea>
          </td>
          <!-- Acciones -->
          <td>
            <div v-if="editingRowId !== proyecto.id_proyecto">
              <button @click="startEditing(proyecto)" class="boton-editar">Editar</button>
            </div>
            <div v-else class="botones-accion">
              <button @click="saveChanges(proyecto.id_proyecto)" class="boton-guardar">Guardar</button>
              <button @click="cancelEditing" class="boton-cancelar">Cancelar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Cargando proyectos...</p>
  </div>
</template>

<script setup>
import '../assets/Proyecto_styles/ecxel.css'
import { ref, onMounted } from 'vue';

const proyectos = ref([]);
const academicosPorProyecto = ref([]);
const unidades = ref([]);
const unidadesPadre = ref([]);
const currentSubUnits = ref([]);
const estatusOptions = ref([]);
const institucionesOptions = ref([]);
const apoyosOptions = ref([]);

// State for inline editing
const editingRowId = ref(null);
const editedProject = ref(null);

// API Endpoints
const url = 'https://elysia-bunbackend-production.up.railway.app/proyectos/data';
const urlAcademicos = 'https://elysia-bunbackend-production.up.railway.app/proyectos/academicosXProyecto';
const urlUnidades = 'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlUpdateProyecto = 'https://elysia-bunbackend-production.up.railway.app/proyectos/update';
const urlEstatus = 'https://elysia-bunbackend-production.up.railway.app/estatus/';
const urlInstituciones = 'https://elysia-bunbackend-production.up.railway.app/inst-convo/';
const urlApoyos = 'https://elysia-bunbackend-production.up.railway.app/apoyos/';

// Utility functions
const formatFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CL');
};

const getAcademicosForProject = (idProyecto) => {
  const proyecto = academicosPorProyecto.value.find(p => p.id_proyecto === idProyecto);
  return proyecto ? proyecto.profesores : [];
};

const getEstatusNombre = (idEstatus) => {
  const est = estatusOptions.value.find(e => e.id_estatus === idEstatus);
  return est ? est.tipo : idEstatus;
};

const getInstitucionNombre = (idInstitucion) => {
  const inst = institucionesOptions.value.find(i => i.id === idInstitucion);
  return inst ? inst.nombre : idInstitucion;
};

const getApoyoNombre = (idApoyo) => {
  const apoyo = apoyosOptions.value.find(a => a.id_apoyo === idApoyo);
  return apoyo ? apoyo.nombre : idApoyo;
};

// Fetch data functions
const fetchOptionsData = async () => {
  try {
    // Fetch estatus options
    const [estatusRes, institucionesRes, apoyosRes] = await Promise.all([
      fetch(urlEstatus),
      fetch(urlInstituciones),
      fetch(urlApoyos)
    ]);

    if (!estatusRes.ok || !institucionesRes.ok || !apoyosRes.ok) {
      throw new Error('Error al obtener opciones');
    }

    estatusOptions.value = await estatusRes.json();
    institucionesOptions.value = await institucionesRes.json();
    apoyosOptions.value = await apoyosRes.json();
  } catch (error) {
    console.error('Error al cargar opciones:', error);
  }
};

const fetchProjectsAndAcademicos = async () => {
  try {
    const [proyectosRes, academicosRes, unidadesRes] = await Promise.all([
      fetch(url),
      fetch(urlAcademicos),
      fetch(urlUnidades)
    ]);

    if (!proyectosRes.ok || !academicosRes.ok || !unidadesRes.ok) {
      throw new Error('Error al obtener datos principales');
    }

    proyectos.value = await proyectosRes.json();
    academicosPorProyecto.value = await academicosRes.json();
    unidades.value = await unidadesRes.json();
    unidadesPadre.value = unidades.value.filter(u => !u.parent_id);
  } catch (error) {
    console.error('Error al cargar datos principales:', error);
  }
};

// Editing functions
const startEditing = (proyecto) => {
  editingRowId.value = proyecto.id_proyecto;
  editedProject.value = JSON.parse(JSON.stringify(proyecto));

  // Format date for input
  if (editedProject.value.fecha_postulacion) {
    const date = new Date(editedProject.value.fecha_postulacion);
    editedProject.value.fecha_postulacion = date.toISOString().split('T')[0];
  }

  // Set up unidad selection
  const currentSubUnit = unidades.value.find(u => u.nombre === editedProject.value.unidad);
  if (currentSubUnit && currentSubUnit.parent_id) {
    editedProject.value.selectedParentUnitId = currentSubUnit.parent_id;
    loadSubUnitsForEdit();
  } else {
    editedProject.value.selectedParentUnitId = '';
    currentSubUnits.value = [];
  }
};

const loadSubUnitsForEdit = () => {
  const parentId = editedProject.value.selectedParentUnitId;
  currentSubUnits.value = [];
  if (parentId) {
    currentSubUnits.value = unidades.value.filter(u => u.parent_id === parentId);
  }
};

const saveChanges = async (idProyecto) => {
  try {
    const index = proyectos.value.findIndex(p => p.id_proyecto === idProyecto);
    if (index === -1) {
      console.error('Proyecto no encontrado');
      return;
    }

    const dataToSend = { ...editedProject.value };

    // Find unidad ID if needed
    const selectedSubUnit = unidades.value.find(u => u.nombre === editedProject.value.unidad);
    if (selectedSubUnit) {
      dataToSend.unidad_id = selectedSubUnit.id_unidad;
    }

    // Remove temporary fields
    delete dataToSend.selectedParentUnitId;

    const response = await fetch(`${urlUpdateProyecto}/${idProyecto}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el proyecto');
    }

    // Update local data
    proyectos.value[index] = { ...proyectos.value[index], ...editedProject.value };

    if (proyectos.value[index].fecha_postulacion) {
      const date = new Date(proyectos.value[index].fecha_postulacion);
      proyectos.value[index].fecha_postulacion = date.toISOString();
    }

    // Exit editing mode
    editingRowId.value = null;
    editedProject.value = null;
    currentSubUnits.value = [];
    console.log('Proyecto actualizado exitosamente');
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    alert('Error al guardar cambios: ' + error.message);
  }
};

const cancelEditing = () => {
  editingRowId.value = null;
  editedProject.value = null;
  currentSubUnits.value = [];
};

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchOptionsData(),
    fetchProjectsAndAcademicos()
  ]);
});
</script>

<style scoped>
/* Tus estilos existentes */
</style>