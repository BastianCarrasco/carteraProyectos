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
          <th>Monto MM</th>
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
        <tr v-for="proyecto in proyectos" :key="proyecto.id_proyecto" class="fila-proyecto">
          <!-- Nombre -->
          <td>{{ proyecto.nombre }}</td>
          <!-- Tematica -->
          <td>{{ getTematicaNombre(proyecto.tematica) }}</td>
          <!-- Estatus -->
          <td>{{ getEstatusNombre(proyecto.estatus) }}</td>
          <!-- Apoyo -->
          <td>{{ getApoyoNombre(proyecto.apoyo) }}</td>
          <!-- Detalle de Apoyo -->
          <td>{{ proyecto.detalle_apoyo }}</td>
          <!-- Monto -->
          <td>${{ (proyecto.monto ? proyecto.monto / 1000000 : 0).toLocaleString() }}</td>
          <!-- Académicos -->
          <td>
            <ul v-if="getAcademicosForProject(proyecto.id_proyecto).length">
              <li v-for="(profesor, index) in getAcademicosForProject(
                proyecto.id_proyecto,
              )" :key="index">
                {{ profesor }}
              </li>
            </ul>
            <span v-else>-</span>
          </td>
          <!-- Unidad -->
          <td>{{ proyecto.unidad }}</td>
          <!-- Convocatoria -->
          <td>{{ proyecto.convocatoria }}</td>
          <!-- Fecha Postulación -->
          <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
          <!-- Institución -->
          <td>{{ getInstitucionNombre(proyecto.institucion) }}</td>
          <!-- Comentario -->
          <td>{{ proyecto.comentarios }}</td>
          <!-- Acciones -->
          <td>
            <button @click="openEditModal(proyecto)" class="boton-editar">
              Editar
            </button>
            <button @click="confirmDelete(proyecto)" class="boton-eliminar">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Cargando proyectos...</p>

    <!-- Modal de Edición Principal -->
    <EditarProyectoModal :show="showEditModal" :editedProject="editedProject" :tematicasOptions="tematicasOptions"
      :estatusOptions="estatusOptions" :apoyosOptions="apoyosOptions" :unidades="unidades"
      :unidadesPadre="unidadesPadre" :currentSubUnits="currentSubUnits" :institucionesOptions="institucionesOptions"
      :tagsOptions="tagsOptions" :selectedTags="selectedTags" :tempSelectedTags="tempSelectedTags" @save="saveChanges"
      @cancel="cancelEditModal" @load-sub-units="loadSubUnitsForEdit" @open-tags-modal="openTagsModal" />

    <!-- Modal para la selección de Tags -->
    <div v-if="showTagsModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Seleccionar Tags de Apoyo</h3>
        <div class="tags-checkbox-group">
          <div v-for="tag in tagsOptions" :key="tag.id_apoyo" class="tag-checkbox-item">
            <input type="checkbox" :id="'tag-' + tag.id_apoyo" :value="tag.id_apoyo" v-model="tempSelectedTags" />
            <label :for="'tag-' + tag.id_apoyo">{{ tag.tag }}</label>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeTagsModal" class="boton-guardar">Aceptar</button>
          <button @click="cancelTagsSelection" class="boton-cancelar">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import '../assets/Proyecto_styles/ecxel.css'; // Asegúrate de que esta ruta sea correcta
import EditarProyectoModal from '@/components/ITEMS/EditarProyectoModal.vue';

const proyectos = ref([]);
const academicosPorProyecto = ref([]);
const unidades = ref([]);
const unidadesPadre = ref([]);
const currentSubUnits = ref([]); // Sub-unidades disponibles para la unidad padre seleccionada
const estatusOptions = ref([]);
const institucionesOptions = ref([]);
const apoyosOptions = ref([]);
const tematicasOptions = ref([]);
const tagsOptions = ref([]);

// State for general editing modal
const showEditModal = ref(false); // Controla la visibilidad del modal de edición principal
const editedProject = ref(null); // Objeto del proyecto que se está editando

// State for tags modal (nested modal)
const showTagsModal = ref(false);
const selectedTags = ref([]); // IDs de los tags seleccionados (para el proyecto)
const tempSelectedTags = ref([]); // IDs de los tags seleccionados temporalmente en el modal de tags

// API Endpoints
const url = 'https://elysia-bunbackend-production.up.railway.app/funciones/data';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';
const urlUnidades = 'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlUpdateProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/'; // Endpoint para PUT
const urlDeleteProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/'; // Endpoint para DELETE
const urlEstatus = 'https://elysia-bunbackend-production.up.railway.app/estatus/';
const urlInstituciones = 'https://elysia-bunbackend-production.up.railway.app/inst-convo/';
const urlApoyos = 'https://elysia-bunbackend-production.up.railway.app/apoyos/';
const urltematicas = 'https://elysia-bunbackend-production.up.railway.app/tematicas/';
const urltags = 'https://elysia-bunbackend-production.up.railway.app/tags/';

// Utility functions
const formatFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CL');
};

const getAcademicosForProject = (idProyecto) => {
  const proyecto = academicosPorProyecto.value.find(
    (p) => p.id_proyecto === idProyecto,
  );
  return proyecto ? proyecto.profesores : [];
};

const getEstatusNombre = (idEstatus) => {
  const est = estatusOptions.value.find((e) => e.id_estatus === idEstatus);
  return est ? est.tipo : idEstatus;
};

const getInstitucionNombre = (idInstitucion) => {
  const inst = institucionesOptions.value.find((i) => i.id === idInstitucion);
  return inst ? inst.nombre : idInstitucion;
};

const getApoyoNombre = (idApoyo) => {
  const apoyo = apoyosOptions.value.find((a) => a.id_apoyo === idApoyo);
  return apoyo ? apoyo.nombre : idApoyo;
};

const getTematicaNombre = (idTematica) => {
  const tematica = tematicasOptions.value.find((t) => t.id_tematica === idTematica);
  return tematica ? tematica.nombre : idTematica;
};

const getUnidadNombre = (idUnidad) => {
  const unidad = unidades.value.find((u) => u.id_unidad === idUnidad);
  return unidad ? unidad.nombre : idUnidad;
};

// Fetch data functions
const fetchOptionsData = async () => {
  try {
    const [estatusRes, institucionesRes, apoyosRes, tematicasRes, tagsRes] =
      await Promise.all([
        fetch(urlEstatus),
        fetch(urlInstituciones),
        fetch(urlApoyos),
        fetch(urltematicas),
        fetch(urltags),
      ]);

    if (
      !estatusRes.ok ||
      !institucionesRes.ok ||
      !apoyosRes.ok ||
      !tematicasRes.ok ||
      !tagsRes.ok
    ) {
      throw new Error('Error al obtener opciones');
    }

    estatusOptions.value = await estatusRes.json();
    institucionesOptions.value = await institucionesRes.json();
    apoyosOptions.value = await apoyosRes.json();
    tematicasOptions.value = await tematicasRes.json();
    tagsOptions.value = await tagsRes.json();
  } catch (error) {
    console.error('Error al cargar opciones:', error);
  }
};

const fetchProjectsAndAcademicos = async () => {
  try {
    const [proyectosRes, academicosRes, unidadesRes] = await Promise.all([
      fetch(url),
      fetch(urlAcademicos),
      fetch(urlUnidades),
    ]);

    if (!proyectosRes.ok || !academicosRes.ok || !unidadesRes.ok) {
      throw new Error('Error al obtener datos principales');
    }

    proyectos.value = await proyectosRes.json();
    academicosPorProyecto.value = await academicosRes.json();
    unidades.value = await unidadesRes.json();
    // Identificar unidades padre (aquellas sin parent_id)
    unidadesPadre.value = unidades.value.filter((u) => !u.parent_id);
  } catch (error) {
    console.error('Error al cargar datos principales:', error);
  }
};

// Main Edit Modal Functions
const openEditModal = (proyecto) => {
  // Clonar profundamente el proyecto para evitar modificar el original directamente
  editedProject.value = JSON.parse(JSON.stringify(proyecto));

  // Formatear la fecha para el input type="date"
  if (editedProject.value.fecha_postulacion) {
    const date = new Date(editedProject.value.fecha_postulacion);
    editedProject.value.fecha_postulacion = date.toISOString().split('T')[0];
  }

  // Lógica para preseleccionar la unidad y su padre
  const currentUnit = unidades.value.find(
    (u) => u.nombre === editedProject.value.unidad,
  );
  if (currentUnit) {
    if (currentUnit.parent_id) {
      // Si la unidad actual tiene un padre, selecciona el padre y carga las subunidades
      editedProject.value.selectedParentUnitId = currentUnit.parent_id;
      currentSubUnits.value = unidades.value.filter(
        (u) => u.parent_id === currentUnit.parent_id,
      );
      // La unidad editada (hija) ya está en editedProject.value.unidad
    } else {
      // Si la unidad actual es una unidad padre, selecciona el padre y se convierte en la unidad final
      editedProject.value.selectedParentUnitId = currentUnit.id_unidad;
      currentSubUnits.value = []; // No hay subunidades para seleccionar si la padre es la final
      // La unidad editada (padre) ya está en editedProject.value.unidad
    }
  } else {
    // Si la unidad no se encontró o no tiene valor, resetear selecciones
    editedProject.value.selectedParentUnitId = '';
    editedProject.value.unidad = '';
    currentSubUnits.value = [];
  }

  // Lógica para inicializar tags para el modal anidado
  const apoyoNombre = getApoyoNombre(editedProject.value.apoyo);
  if (apoyoNombre === 'PARCIAL') {
    if (
      editedProject.value.detalle_apoyo &&
      typeof editedProject.value.detalle_apoyo === 'string'
    ) {
      selectedTags.value = editedProject.value.detalle_apoyo
        .split(', ')
        .map((tagText) => {
          const tag = tagsOptions.value.find((t) => t.tag === tagText);
          return tag ? tag.id_apoyo : null;
        })
        .filter((id) => id !== null);
    } else {
      selectedTags.value = [];
    }
  } else {
    selectedTags.value = [];
  }

  showEditModal.value = true;
};

const loadSubUnitsForEdit = () => {
  const parentId = editedProject.value.selectedParentUnitId;
  currentSubUnits.value = [];
  if (parentId) {
    currentSubUnits.value = unidades.value.filter(
      (u) => u.parent_id === parentId,
    );

    // Si la unidad seleccionada previamente (editedProject.value.unidad)
    // no es una sub-unidad válida para el nuevo padre seleccionado,
    // o si el padre seleccionado no tiene sub-unidades,
    // o si la unidad padre recién seleccionada es la unidad final
    const selectedParentUnitObject = unidades.value.find(
      (u) => u.id_unidad === parentId,
    );
    if (
      !currentSubUnits.value.some(
        (sub) => sub.nombre === editedProject.value.unidad,
      ) ||
      currentSubUnits.value.length === 0
    ) {
      // Si el padre seleccionado no tiene subunidades, y el usuario quiere que el padre sea la unidad final
      if (
        currentSubUnits.value.length === 0 &&
        editedProject.value.selectedParentUnitId
      ) {
        // En este caso, la unidad final debe ser el nombre del padre
        editedProject.value.unidad = selectedParentUnitObject?.nombre || '';
      } else {
        // De lo contrario, limpiar la selección de sub-unidad
        editedProject.value.unidad = '';
      }
    }
    // Si hay subunidades disponibles, pero editedProject.value.unidad es el padre
    if (
      currentSubUnits.value.length > 0 &&
      editedProject.value.unidad === selectedParentUnitObject?.nombre
    ) {
      editedProject.value.unidad = ''; // Limpiar para forzar la selección de sub-unidad
    }
  } else {
    // Si no se selecciona una unidad padre, limpia también la unidad final
    editedProject.value.unidad = '';
    currentSubUnits.value = [];
  }
};

// Función para actualizar detalle_apoyo basado en los tags seleccionados (para el input readonly)
const updateDetalleApoyoFromTags = () => {
  if (selectedTags.value.length > 0) {
    editedProject.value.detalle_apoyo = selectedTags.value
      .map((id) => tagsOptions.value.find((tag) => tag.id_apoyo === id)?.tag)
      .filter((tag) => tag !== undefined)
      .join(', ');
  } else if (getApoyoNombre(editedProject.value.apoyo) === 'PARCIAL') {
    editedProject.value.detalle_apoyo = '';
  }
};

// Watcher para el cambio de apoyo dentro del modal de edición principal
watch(
  () => editedProject.value?.apoyo,
  (newApoyoId) => {
    if (editedProject.value) {
      const apoyoNombre = getApoyoNombre(newApoyoId);
      if (apoyoNombre === 'TOTAL') {
        editedProject.value.detalle_apoyo = 'TOTAL';
        selectedTags.value = [];
        tempSelectedTags.value = [];
      } else if (apoyoNombre === 'PARCIAL') {
        // Re-evaluar `selectedTags` si el `detalle_apoyo` no está vacío, o inicializarlo vacío
        if (
          editedProject.value.detalle_apoyo &&
          typeof editedProject.value.detalle_apoyo === 'string' &&
          editedProject.value.detalle_apoyo !== 'TOTAL'
        ) {
          selectedTags.value = editedProject.value.detalle_apoyo
            .split(', ')
            .map((tagText) => {
              const tag = tagsOptions.value.find((t) => t.tag === tagText);
              return tag ? tag.id_apoyo : null;
            })
            .filter((id) => id !== null);
        } else {
          selectedTags.value = []; // Si cambia a PARCIAL y el detalle_apoyo era 'TOTAL' o vacío, limpiar tags
        }
        updateDetalleApoyoFromTags();
      } else {
        editedProject.value.detalle_apoyo = '';
        selectedTags.value = [];
        tempSelectedTags.value = [];
      }
    }
  },
  { deep: true },
); // Usamos deep para ver si editedProject.value cambia

// Watcher para los tags seleccionados (siempre actualiza el string en editedProject.detalle_apoyo)
watch(
  selectedTags,
  () => {
    if (
      editedProject.value &&
      getApoyoNombre(editedProject.value.apoyo) === 'PARCIAL'
    ) {
      updateDetalleApoyoFromTags();
    }
  },
  { deep: true },
);

const saveChanges = async () => {
  if (!editedProject.value) return;

  try {
    const idProyecto = editedProject.value.id_proyecto;
    const index = proyectos.value.findIndex(
      (p) => p.id_proyecto === idProyecto,
    );
    if (index === -1) {
      console.error('Proyecto no encontrado en la lista local');
      alert('Error: Proyecto no encontrado para actualizar.');
      return;
    }

    // --- Mapeo correcto de campos a IDs ---
    const requestBody = {
      nombre: editedProject.value.nombre,
      monto: editedProject.value.monto,
      fecha_postulacion: editedProject.value.fecha_postulacion
        ? new Date(editedProject.value.fecha_postulacion).toISOString()
        : null,
      comentarios: editedProject.value.comentarios,
      // Obtener ID de la unidad por nombre
      unidad: unidades.value.find(u => u.nombre === editedProject.value.unidad)?.id_unidad || null,
      // Obtener ID de la temática
      id_tematica: tematicasOptions.value.find(t => t.nombre === editedProject.value.tematica)
        ? tematicasOptions.value.find(t => t.nombre === editedProject.value.tematica).id_tematica
        : editedProject.value.tematica,
      // Obtener ID del estatus
      id_estatus: estatusOptions.value.find(e => e.tipo === editedProject.value.estatus)?.id_estatus || null,
      id_kth: null,
      convocatoria: editedProject.value.convocatoria,
      tipo_convocatoria: 1,
      // Obtener ID de la institución
      inst_conv: institucionesOptions.value.find(i => i.nombre === editedProject.value.institucion)?.id || null,
      detalle_apoyo: editedProject.value.detalle_apoyo,
      // Obtener ID del apoyo
      apoyo: apoyosOptions.value.find(a => a.nombre === editedProject.value.apoyo)
        ? apoyosOptions.value.find(a => a.nombre === editedProject.value.apoyo).id_apoyo
        : editedProject.value.apoyo,
    };

    console.log('JSON a enviar:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${urlUpdateProyecto}${idProyecto}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el proyecto');
    }

    // Actualizar el proyecto en el frontend
    proyectos.value[index] = { ...proyectos.value[index], ...editedProject.value };

    alert('Proyecto actualizado exitosamente!');
    showEditModal.value = false;
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    alert('Error al guardar cambios: ' + error.message);
  }
};

const cancelEditModal = () => {
  showEditModal.value = false;
  editedProject.value = null;
  selectedTags.value = [];
  tempSelectedTags.value = [];
  currentSubUnits.value = [];
};

// Modal Tags Functions
const openTagsModal = () => {
  tempSelectedTags.value = [...selectedTags.value]; // Copiar la selección actual
  showTagsModal.value = true;
};

const closeTagsModal = () => {
  selectedTags.value = [...tempSelectedTags.value]; // Aplicar la selección
  updateDetalleApoyoFromTags(); // Actualiza el texto del input
  showTagsModal.value = false;
};

const cancelTagsSelection = () => {
  showTagsModal.value = false; // Simplemente cerrar, descartando cambios en tempSelectedTags
};

// --- Funciones para Eliminar Proyecto ---

const confirmDelete = async (proyecto) => {
  const isConfirmed = window.confirm(
    `¿Estás seguro de que quieres eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`,
  );

  if (isConfirmed) {
    const isDoubleConfirmed = window.confirm(
      `¡ADVERTENCIA! Vas a eliminar "${proyecto.nombre}". ¿Estás ABSOLUTAMENTE seguro?`,
    );
    if (isDoubleConfirmed) {
      await deleteProject(proyecto.id_proyecto);
    } else {
      alert('Eliminación cancelada.');
    }
  } else {
    alert('Eliminación cancelada.');
  }
};

const deleteProject = async (idProyecto) => {
  try {
    console.log(`Intentando eliminar proyecto con ID: ${idProyecto}`);
    const response = await fetch(`${urlDeleteProyecto}${idProyecto}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Leer el cuerpo de la respuesta una única vez, si existe
    let responseBody = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (jsonParseError) {
        console.warn('La respuesta se marcó como JSON pero no pudo ser parseada:', jsonParseError);
        // Si falla el parseo de JSON, a veces puedes intentar como texto, pero cuidado con doble consumo
        responseBody = await response.text().catch(() => null); // Intenta leer como texto si falla json, con catch adicional
      }
    } else {
      // Si no es JSON, o no tiene Content-Type, intenta leer como texto
      responseBody = await response.text().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      if (responseBody) {
        // Si el cuerpo es un objeto (JSON parseado), toma el mensaje
        if (typeof responseBody === 'object' && responseBody !== null && responseBody.message) {
          errorMessage = responseBody.message;
        } else if (typeof responseBody === 'string') {
          // Si es un string (texto plano), úsalo directamente
          errorMessage = responseBody;
        } else {
          // Si es un JSON pero sin 'message', stringify el objeto completo
          errorMessage = JSON.stringify(responseBody);
        }
      }
      throw new Error(errorMessage);
    }

    // Si la respuesta es exitosa (response.ok es true)
    console.log(`Proyecto con ID ${idProyecto} eliminado exitosamente.`);
    alert('Proyecto eliminado exitosamente!');

    // Actualizar la lista de proyectos localmente
    proyectos.value = proyectos.value.filter(
      (p) => p.id_proyecto !== idProyecto,
    );
    academicosPorProyecto.value = academicosPorProyecto.value.filter(
      (p) => p.id_proyecto !== idProyecto,
    );
  } catch (error) {
    console.error(`Error al eliminar el proyecto ${idProyecto}:`, error);
    alert('Error al eliminar el proyecto: ' + error.message);
  }
};

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([fetchOptionsData(), fetchProjectsAndAcademicos()]);
});
</script>

<!-- Asumiendo que tus estilos están en `src/assets/Proyecto_styles/ecxel.css` -->
<!-- No se incluye aquí ya que es un archivo externo -->

<style></style>