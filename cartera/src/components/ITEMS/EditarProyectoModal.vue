<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content-lg">
      <h3>Editar Proyecto: {{ localEditedProject?.nombre }}</h3>
      <form @submit.prevent="onSave">
        <!-- Nombre -->
        <div class="modal-form-group">
          <label for="edit-nombre">Nombre:</label>
          <input id="edit-nombre" v-model="localEditedProject.nombre" required />
        </div>

        <!-- Temática -->
        <div class="modal-form-group">
          <label for="edit-tematica">Temática:</label>
          <select id="edit-tematica" v-model="localEditedProject.tematica">
            <option disabled value="">Seleccione una temática</option>
            <option v-for="tematica in tematicasOptions" :key="tematica.id_tematica" :value="tematica.nombre">
              {{ tematica.nombre }}
            </option>
          </select>
        </div>

        <!-- Estatus -->
        <div class="modal-form-group">
          <label for="edit-estatus">Estatus:</label>
          <select id="edit-estatus" v-model="localEditedProject.estatus">
            <option disabled value="">Seleccione un estatus</option>
            <option v-for="est in estatusOptions" :key="est.id_estatus" :value="est.tipo">
              {{ est.tipo }}
            </option>
          </select>
        </div>

        <!-- Apoyo -->
        <div class="modal-form-group">
          <label for="edit-apoyo">Apoyo:</label>
          <select id="edit-apoyo" v-model="localEditedProject.apoyo">
            <option disabled value="">Seleccione un tipo de apoyo</option>
            <option v-for="apoyo in apoyosOptions" :key="apoyo.id_apoyo" :value="apoyo.nombre">
              {{ apoyo.nombre }}
            </option>
          </select>
        </div>

        <!-- Detalle Apoyo & Tags Section -->
        <div class="modal-form-group">
          <label for="edit-detalle-apoyo">Detalle de Apoyo:</label>
          <input v-model="localEditedProject.detalle_apoyo" :readonly="localEditedProject.apoyo !== 'PARCIAL'" />
          <!-- Only show tags selection if 'PARCIAL' is selected -->
          <button type="button" @click="toggleTagsSection" v-if="localEditedProject.apoyo === 'PARCIAL'"
            class="boton-seleccionar-tags">
            {{ showTagsSection ? 'Ocultar Tags' : 'Seleccionar Tags' }}
          </button>
        </div>

        <!-- Tags Selection Area (directly within this modal) -->
        <div v-if="showTagsSection && localEditedProject.apoyo === 'PARCIAL'" class="tags-selection-area">
          <h4>Tags de Apoyo</h4>
          <div class="tags-checkbox-group">
            <div v-for="tag in tagsOptions" :key="tag.id_apoyo" class="tag-checkbox-item">
              <input type="checkbox" :id="'tag-' + tag.id_apoyo" :value="tag.id_apoyo" v-model="selectedTags" />
              <label :for="'tag-' + tag.id_apoyo">{{ tag.tag }}</label>
            </div>
          </div>
          <!-- No 'Aceptar'/'Cancelar' buttons needed here, changes apply directly -->
        </div>

        <!-- Monto -->
        <div class="modal-form-group">
          <label for="edit-monto">Monto:</label>
          <input id="edit-monto" type="number" v-model.number="localEditedProject.monto" />
        </div>

        <!-- Unidad (Parent Unit and Sub-Unit selection) -->
        <div class="modal-form-group">
          <label for="edit-parent-unidad">Unidad Padre:</label>
          <select id="edit-parent-unidad" v-model="localEditedProject.selectedParentUnitId"
            @change="$emit('load-sub-units')">
            <option disabled value="">Seleccione una unidad padre</option>
            <option v-for="unidad in unidadesPadre" :key="unidad.id_unidad" :value="unidad.id_unidad">
              {{ unidad.nombre }}
            </option>
          </select>
        </div>

        <div class="modal-form-group" v-if="
          localEditedProject.selectedParentUnitId && currentSubUnits.length > 0
        ">
          <label for="edit-sub-unidad">Sub-Unidad:</label>
          <select id="edit-sub-unidad" v-model="localEditedProject.unidad">
            <option disabled value="">Seleccione una sub-unidad</option>
            <option v-for="unidad in currentSubUnits" :key="unidad.id_unidad" :value="unidad.nombre">
              {{ unidad.nombre }}
            </option>
          </select>
        </div>
        <div class="modal-form-group" v-else-if="
          localEditedProject.selectedParentUnitId && currentSubUnits.length === 0
        ">
          <label for="edit-final-unidad">Unidad:</label>
          <input id="edit-final-unidad" :value="getUnidadNombre(localEditedProject.selectedParentUnitId)" readonly />
          <p class="help-text">
            Esta unidad no tiene sub-unidades, la unidad padre será la final.
          </p>
        </div>
        <div class="modal-form-group" v-else>
          <label for="edit-unidad-directa">Unidad:</label>
          <input id="edit-unidad-directa" v-model="localEditedProject.unidad"
            placeholder="Seleccione una unidad padre primero" readonly />
        </div>

        <!-- Convocatoria -->
        <div class="modal-form-group">
          <label for="edit-convocatoria">Convocatoria:</label>
          <input id="edit-convocatoria" v-model="localEditedProject.convocatoria" />
        </div>

        <!-- Tipo Convocatoria -->
        <div class="modal-form-group">
          <label for="edit-tipo-convocatoria">Tipo Convocatoria:</label>
          <select id="edit-tipo-convocatoria" v-model="localEditedProject.tipo_convocatoria">
            <option disabled value="">Seleccione un tipo de convocatoria</option>
            <option v-for="tipo in tipoConvocatoriasOptions" :key="tipo.id" :value="tipo.nombre">
              {{ tipo.nombre }}
            </option>
          </select>
        </div>

        <!-- Fecha -->
        <div class="modal-form-group">
          <label for="edit-fecha-postulacion">Fecha Postulación:</label>
          <input id="edit-fecha-postulacion" type="date" v-model="localEditedProject.fecha_postulacion" />
        </div>

        <!-- Institución -->
        <div class="modal-form-group">
          <label for="edit-institucion">Institución:</label>
          <select id="edit-institucion" v-model="localEditedProject.institucion">
            <option disabled value="">Seleccione una institución</option>
            <option v-for="inst in institucionesOptions" :key="inst.id" :value="inst.nombre">
              {{ inst.nombre }}
            </option>
          </select>
        </div>

        <!-- Comentarios -->
        <div class="modal-form-group">
          <label for="edit-comentarios">Comentario:</label>
          <textarea id="edit-comentarios" v-model="localEditedProject.comentarios"></textarea>
        </div>

        <div class="modal-actions">
          <button type="submit" class="boton-guardar">Guardar Cambios</button>
          <button type="button" @click="onCancel" class="boton-cancelar">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRef } from 'vue';

const props = defineProps({
  show: Boolean,
  editedProject: Object, // This object contains names (strings) for select fields
  tematicasOptions: Array,
  estatusOptions: Array,
  apoyosOptions: Array,
  unidades: Array,
  unidadesPadre: Array,
  currentSubUnits: Array,
  institucionesOptions: Array,
  tipoConvocatoriasOptions: Array,
  tagsOptions: Array, // Passed down from parent, used for checkbox labels/values
  // selectedTags and tempSelectedTags are now internal to this component
});

const emit = defineEmits(['save', 'cancel', 'load-sub-units', 'update:editedProject']);

// Create a local ref for editedProject to allow internal modifications
const localEditedProject = ref(props.editedProject);
const showTagsSection = ref(false); // Controls visibility of the tags checkbox group
const selectedTags = ref([]); // Stores IDs of selected tags (internal state)

// Watch for changes in the prop 'editedProject' and update the local ref
watch(toRef(props, 'editedProject'), (newVal) => {
  if (newVal) {
    localEditedProject.value = JSON.parse(JSON.stringify(newVal)); // Deep copy

    // Re-initialize selectedTags when editedProject changes (e.g., a new project is opened)
    initializeSelectedTags();
  }
}, { deep: true, immediate: true }); // immediate: true to run on initial mount

// Watch for changes in the 'apoyo' selection
watch(() => localEditedProject.value?.apoyo, (newApoyoNombre) => {
  if (!localEditedProject.value) return;

  if (newApoyoNombre === 'TOTAL') {
    localEditedProject.value.detalle_apoyo = 'TOTAL';
    selectedTags.value = [];
    showTagsSection.value = false; // Hide tags section if not partial
  } else if (newApoyoNombre === 'PARCIAL') {
    // When switching to PARCIAL, if current detalle_apoyo doesn't match parsed tags
    // or is 'TOTAL', re-initialize.
    initializeSelectedTags();
  } else {
    localEditedProject.value.detalle_apoyo = '';
    selectedTags.value = [];
    showTagsSection.value = false; // Hide tags section if no apoyo or other type
  }
}, { deep: true });


// Watch for changes in selectedTags and update detalle_apoyo
watch(selectedTags, () => {
  if (
    localEditedProject.value &&
    localEditedProject.value.apoyo === 'PARCIAL'
  ) {
    updateDetalleApoyoFromTags();
  }
});

// Function to initialize selectedTags from detalle_apoyo string
const initializeSelectedTags = () => {
  selectedTags.value = []; // Reset first
  if (
    localEditedProject.value.apoyo === 'PARCIAL' &&
    localEditedProject.value.detalle_apoyo &&
    typeof localEditedProject.value.detalle_apoyo === 'string' &&
    localEditedProject.value.detalle_apoyo !== 'TOTAL'
  ) {
    const detailTags = localEditedProject.value.detalle_apoyo.split(', ').map(tag => tag.trim());
    selectedTags.value = props.tagsOptions
      .filter(tagOpt => detailTags.includes(tagOpt.tag))
      .map(tagOpt => tagOpt.id_apoyo);
  }
};


const updateDetalleApoyoFromTags = () => {
  if (selectedTags.value.length > 0) {
    localEditedProject.value.detalle_apoyo = selectedTags.value
      .map((id) => props.tagsOptions.find((tag) => tag.id_apoyo === id)?.tag)
      .filter((tag) => tag !== undefined)
      .join(', ');
  } else if (localEditedProject.value.apoyo === 'PARCIAL') {
    localEditedProject.value.detalle_apoyo = '';
  }
  // Emit update so parent always has the latest editedProject including detalle_apoyo
  emit('update:editedProject', localEditedProject.value);
};

const toggleTagsSection = () => {
  showTagsSection.value = !showTagsSection.value;
};

const onSave = () => {
  // Emit the locally managed editedProject
  emit('save', localEditedProject.value);
};

const onCancel = () => {
  emit('cancel');
};

const getUnidadNombre = (idUnidad) => {
  const unidad = props.unidades.find((u) => u.id_unidad === idUnidad);
  return unidad ? unidad.nombre : '';
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal-form-group {
  margin-bottom: 1rem;
}

.modal-form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.modal-form-group input,
.modal-form-group select,
.modal-form-group textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.modal-form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.boton-guardar {
  background-color: #28a745;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.boton-cancelar {
  background-color: #dc3545;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.boton-seleccionar-tags {
  background-color: #007bff;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: block;
}

.help-text {
  font-size: 0.85em;
  color: #666;
  margin-top: 0.3rem;
}

/* New Styles for Tags Selection Area */
.tags-selection-area {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.tags-selection-area h4 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: #333;
  font-size: 1.1rem;
}

.tags-checkbox-group {
  display: grid;
  /* Use grid for better layout */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* Responsive columns */
  gap: 0.75rem;
  /* Space between items */
}

.tag-checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
}

.tag-checkbox-item input[type="checkbox"] {
  width: auto;
  /* Override full width */
  margin: 0;
}

.tag-checkbox-item label {
  margin: 0;
  font-weight: normal;
  /* Labels within checkboxes usually aren't bold */
  cursor: pointer;
}
</style>