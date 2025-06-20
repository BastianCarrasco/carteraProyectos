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
          <th>Tipo Convocatoria</th>
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
          <td>{{ getTematicaNombre(proyecto.id_tematica) }}</td>
          <!-- Estatus -->
          <td>{{ getEstatusNombre(proyecto.id_estatus) }}</td>
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
          <td>{{ getUnidadNombre(proyecto.unidad) }}</td>
          <!-- Convocatoria -->
          <td>{{ proyecto.convocatoria }}</td>
          <!-- Tipo Convocatoria -->
          <td>{{ getTipoConvocatoriaNombre(proyecto.tipo_convocatoria) }}</td>
          <!-- Fecha Postulación -->
          <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
          <!-- Institución -->
          <td>{{ getInstitucionNombre(proyecto.inst_conv) }}</td>
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
      :tipoConvocatoriasOptions="tipoConvocatoriasOptions" :tagsOptions="tagsOptions" :selectedTags="selectedTags"
      :tempSelectedTags="tempSelectedTags" @save="saveChanges" @cancel="cancelEditModal"
      @load-sub-units="loadSubUnitsForEdit" @open-tags-modal="openTagsModal" />

    <!-- Modal para la selección de Tags -->
    <div v-if="showTagsModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Seleccionar Tags de Apoyo</h3>
        <div class="tags-checkbox-group">
          <div v-for="tag in tagsOptions" :key="tag.id_apoyo" class="tag-checkbox-item">
            <!-- Ensure v-model maps to tempSelectedTags which holds array of tag IDs -->
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
import '../assets/Proyecto_styles/ecxel.css';
import EditarProyectoModal from '@/components/ITEMS/EditarProyectoModal.vue';

const proyectos = ref([]);
const academicosPorProyecto = ref([]);
const unidades = ref([]);
const unidadesPadre = ref([]);
const currentSubUnits = ref([]);
const estatusOptions = ref([]);
const institucionesOptions = ref([]);
const apoyosOptions = ref([]);
const tematicasOptions = ref([]);
const tagsOptions = ref([]); // This holds the tags data like { id_apoyo, tag }
const tipoConvocatoriasOptions = ref([]);

const showEditModal = ref(false);
const editedProject = ref(null);

const showTagsModal = ref(false);
const selectedTags = ref([]); // Stores IDs of selected tags
const tempSelectedTags = ref([]); // Temporary storage for tags in the modal

// URLs (unchanged)
const url = 'https://elysia-bunbackend-production.up.railway.app/proyectos/crudo';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';
const urlUnidades = 'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlUpdateProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/';
const urlDeleteProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/';
const urlEstatus = 'https://elysia-bunbackend-production.up.railway.app/estatus/';
const urlInstituciones =
  'https://elysia-bunbackend-production.up.railway.app/inst-convo/';
const urlApoyos = 'https://elysia-bunbackend-production.up.railway.app/apoyos/';
const urltematicas = 'https://elysia-bunbackend-production.up.railway.app/tematicas/';
const urltags = 'https://elysia-bunbackend-production.up.railway.app/tags/'; // Fetches { id_apoyo, tag }
const urlTipoConvocatorias =
  'https://elysia-bunbackend-production.up.railway.app/tipo-convo/';

// Helper functions for displaying names from IDs (unchanged, as they were correct)
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
  const tematica = tematicasOptions.value.find(
    (t) => t.id_tematica === idTematica,
  );
  return tematica ? tematica.nombre : idTematica;
};

const getUnidadNombre = (idUnidad) => {
  const unidad = unidades.value.find((u) => u.id_unidad === idUnidad);
  return unidad ? unidad.nombre : idUnidad;
};

const getTipoConvocatoriaNombre = (idTipo) => {
  const tipo = tipoConvocatoriasOptions.value.find((t) => t.id === idTipo);
  return tipo ? tipo.nombre : idTipo;
};

// Fetching options data (unchanged, works correctly)
const fetchOptionsData = async () => {
  try {
    const [
      estatusRes,
      institucionesRes,
      apoyosRes,
      tematicasRes,
      tagsRes,
      tipoConvocatoriasRes,
    ] = await Promise.all([
      fetch(urlEstatus),
      fetch(urlInstituciones),
      fetch(urlApoyos),
      fetch(urltematicas),
      fetch(urltags), // Fetches tag data
      fetch(urlTipoConvocatorias),
    ]);

    if (
      !estatusRes.ok ||
      !institucionesRes.ok ||
      !apoyosRes.ok ||
      !tematicasRes.ok ||
      !tagsRes.ok ||
      !tipoConvocatoriasRes.ok
    ) {
      throw new Error('Error al obtener opciones');
    }

    estatusOptions.value = await estatusRes.json();
    institucionesOptions.value = await institucionesRes.json();
    apoyosOptions.value = await apoyosRes.json();
    tematicasOptions.value = await tematicasRes.json();
    tagsOptions.value = await tagsRes.json(); // Assign fetched tags
    tipoConvocatoriasOptions.value = await tipoConvocatoriasRes.json();
  } catch (error) {
    console.error('Error al cargar opciones:', error);
  }
};

// Fetching main project data (unchanged, works correctly)
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
    unidadesPadre.value = unidades.value.filter((u) => !u.parent_id);
  } catch (error) {
    console.error('Error al cargar datos principales:', error);
  }
};

// *** ADJUSTED FUNCTION: openEditModal (specifically for tags parsing) ***
const openEditModal = (proyecto) => {
  editedProject.value = JSON.parse(JSON.stringify(proyecto));

  if (editedProject.value.fecha_postulacion) {
    const date = new Date(editedProject.value.fecha_postulacion);
    editedProject.value.fecha_postulacion = date.toISOString().split('T')[0];
  }

  editedProject.value.tematica = getTematicaNombre(editedProject.value.id_tematica);
  editedProject.value.estatus = getEstatusNombre(editedProject.value.id_estatus);
  editedProject.value.apoyo = getApoyoNombre(editedProject.value.apoyo);
  editedProject.value.institucion = getInstitucionNombre(editedProject.value.inst_conv);
  editedProject.value.tipo_convocatoria = getTipoConvocatoriaNombre(editedProject.value.tipo_convocatoria);

  const currentUnit = unidades.value.find(
    (u) => u.id_unidad === proyecto.unidad,
  );
  if (currentUnit) {
    if (currentUnit.parent_id) {
      editedProject.value.selectedParentUnitId = currentUnit.parent_id;
      editedProject.value.unidad = currentUnit.nombre;
      currentSubUnits.value = unidades.value.filter(
        (u) => u.parent_id === currentUnit.parent_id,
      );
    } else {
      editedProject.value.selectedParentUnitId = currentUnit.id_unidad;
      editedProject.value.unidad = currentUnit.nombre;
      currentSubUnits.value = [];
    }
  } else {
    editedProject.value.selectedParentUnitId = '';
    editedProject.value.unidad = '';
    currentSubUnits.value = [];
  }

  // --- START TAGS FIX ---
  // Determine the name of the 'apoyo' type from the original project ID
  const apoyoNombreFromId = getApoyoNombre(proyecto.apoyo);

  if (apoyoNombreFromId === 'PARCIAL') {
    if (
      editedProject.value.detalle_apoyo &&
      typeof editedProject.value.detalle_apoyo === 'string' &&
      editedProject.value.detalle_apoyo !== 'TOTAL' // Make sure it's not the 'TOTAL' string
    ) {
      const detailTags = editedProject.value.detalle_apoyo.split(', ').map(tag => tag.trim());
      // Map the tag names from detalle_apoyo back to their IDs using tagsOptions
      selectedTags.value = tagsOptions.value
        .filter(tagOpt => detailTags.includes(tagOpt.tag))
        .map(tagOpt => tagOpt.id_apoyo);
    } else {
      selectedTags.value = [];
    }
  } else {
    // If not PARCIAL, ensure no tags are selected
    selectedTags.value = [];
  }
  tempSelectedTags.value = [...selectedTags.value]; // Initialize temp with current selected tags
  // --- END TAGS FIX ---

  showEditModal.value = true;
};

// Logic for loading sub-units (unchanged, as it was correct)
const loadSubUnitsForEdit = () => {
  const parentId = editedProject.value.selectedParentUnitId;
  currentSubUnits.value = [];
  if (parentId) {
    currentSubUnits.value = unidades.value.filter(
      (u) => u.parent_id === parentId,
    );

    const selectedParentUnitObject = unidades.value.find(
      (u) => u.id_unidad === parentId,
    );

    if (
      !currentSubUnits.value.some(
        (sub) => sub.nombre === editedProject.value.unidad,
      ) &&
      currentSubUnits.value.length > 0
    ) {
      editedProject.value.unidad = '';
    } else if (currentSubUnits.value.length === 0) {
      editedProject.value.unidad = selectedParentUnitObject?.nombre || '';
    }
  } else {
    editedProject.value.unidad = '';
    currentSubUnits.value = [];
  }
};

const updateDetalleApoyoFromTags = () => {
  if (selectedTags.value.length > 0) {
    // Convert selected tag IDs back to a comma-separated string of tag names
    editedProject.value.detalle_apoyo = selectedTags.value
      .map((id) => tagsOptions.value.find((tag) => tag.id_apoyo === id)?.tag)
      .filter((tag) => tag !== undefined)
      .join(', ');
  } else if (editedProject.value.apoyo === 'PARCIAL') {
    editedProject.value.detalle_apoyo = '';
  }
};

// *** ADJUSTED WATCHER: for editedProject.value?.apoyo (for tags logic on change) ***
watch(
  () => editedProject.value?.apoyo,
  (newApoyoNombre) => {
    if (editedProject.value) {
      if (newApoyoNombre === 'TOTAL') {
        editedProject.value.detalle_apoyo = 'TOTAL';
        selectedTags.value = [];
        tempSelectedTags.value = [];
      } else if (newApoyoNombre === 'PARCIAL') {
        // When switching to PARCIAL, if there's existing detalle_apoyo that isn't 'TOTAL'
        // and doesn't match current tags, try to parse it. Otherwise, clear tags.
        const currentDetailApoyo = editedProject.value.detalle_apoyo;
        const currentTagNames = selectedTags.value
          .map((id) => tagsOptions.value.find((tag) => tag.id_apoyo === id)?.tag)
          .filter((tag) => tag !== undefined)
          .join(', ');

        if (
          currentDetailApoyo &&
          typeof currentDetailApoyo === 'string' &&
          currentDetailApoyo !== 'TOTAL' &&
          currentDetailApoyo !== currentTagNames // Only re-parse if it's different from current tags
        ) {
          const detailTags = currentDetailApoyo.split(', ').map(tag => tag.trim());
          selectedTags.value = tagsOptions.value
            .filter(tagOpt => detailTags.includes(tagOpt.tag))
            .map(tagOpt => tagOpt.id_apoyo);
        } else if (!currentDetailApoyo || currentDetailApoyo === 'TOTAL') {
          // If switching to PARCIAL from empty or TOTAL, reset tags
          selectedTags.value = [];
        }
        updateDetalleApoyoFromTags(); // Ensure detalle_apoyo reflects selectedTags
      } else {
        editedProject.value.detalle_apoyo = '';
        selectedTags.value = [];
        tempSelectedTags.value = [];
      }
      // Always update tempSelectedTags to reflect selectedTags after logic
      tempSelectedTags.value = [...selectedTags.value];
    }
  },
  { deep: true },
);

// Watcher for selectedTags (unchanged, as it was correct)
watch(
  selectedTags,
  () => {
    if (
      editedProject.value &&
      editedProject.value.apoyo === 'PARCIAL'
    ) {
      updateDetalleApoyoFromTags();
    }
  },
  { deep: true },
);


// saveChanges function (unchanged, as it was correct in previous iteration)
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

    const requestBody = {
      nombre: editedProject.value.nombre,
      monto: editedProject.value.monto,
      fecha_postulacion: editedProject.value.fecha_postulacion
        ? new Date(editedProject.value.fecha_postulacion).toISOString()
        : null,
      comentarios: editedProject.value.comentarios,
      unidad:
        unidades.value.find((u) => u.nombre === editedProject.value.unidad)
          ?.id_unidad || null,
      id_tematica:
        tematicasOptions.value.find(
          (t) => t.nombre === editedProject.value.tematica,
        )?.id_tematica || null,
      id_estatus:
        estatusOptions.value.find((e) => e.tipo === editedProject.value.estatus)
          ?.id_estatus || null,
      id_kth: null,
      convocatoria: editedProject.value.convocatoria,
      tipo_convocatoria:
        tipoConvocatoriasOptions.value.find(
          (tc) => tc.nombre === editedProject.value.tipo_convocatoria,
        )?.id || null,
      inst_conv:
        institucionesOptions.value.find(
          (i) => i.nombre === editedProject.value.institucion,
        )?.id || null,
      detalle_apoyo: editedProject.value.detalle_apoyo,
      apoyo:
        apoyosOptions.value.find((a) => a.nombre === editedProject.value.apoyo)
          ?.id_apoyo || null,
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

    await fetchProjectsAndAcademicos();
    await fetchOptionsData();

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

const openTagsModal = () => {
  tempSelectedTags.value = [...selectedTags.value]; // Copy selected tags for the modal
  showTagsModal.value = true;
};

const closeTagsModal = () => {
  selectedTags.value = [...tempSelectedTags.value]; // Apply temporary changes
  updateDetalleApoyoFromTags(); // Update the displayed string
  showTagsModal.value = false;
};

const cancelTagsSelection = () => {
  showTagsModal.value = false;
};

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

    let responseBody = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (jsonParseError) {
        console.warn(
          'La respuesta se marcó como JSON pero no pudo ser parseada:',
          jsonParseError,
        );
        responseBody = await response.text().catch(() => null);
      }
    } else {
      responseBody = await response.text().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      if (responseBody) {
        if (
          typeof responseBody === 'object' &&
          responseBody !== null &&
          responseBody.message
        ) {
          errorMessage = responseBody.message;
        } else if (typeof responseBody === 'string') {
          errorMessage = responseBody;
        } else {
          errorMessage = JSON.stringify(responseBody);
        }
      }
      throw new Error(errorMessage);
    }

    console.log(`Proyecto con ID ${idProyecto} eliminado exitosamente.`);
    alert('Proyecto eliminado exitosamente!');

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

onMounted(async () => {
  await Promise.all([fetchOptionsData(), fetchProjectsAndAcademicos()]);
});
</script>

<style>
/* Your existing styles */
</style>