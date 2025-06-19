<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <h3>Seleccionar Tags de Apoyo</h3>
            <div class="tags-checkbox-group">
                <div v-for="tag in tagsOptions" :key="tag.id_apoyo" class="tag-checkbox-item">
                    <input type="checkbox" :id="'tag-' + tag.id_apoyo" :value="tag.id_apoyo"
                        v-model="currentSelectedTags" />
                    <label :for="'tag-' + tag.id_apoyo">{{ tag.tag }}</label>
                </div>
            </div>
            <div class="modal-actions">
                <button @click="acceptSelection" class="boton-guardar">Aceptar</button>
                <button @click="$emit('cancel-selection')" class="boton-cancelar">
                    Cancelar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    tagsOptions: {
        type: Array,
        required: true,
    },
    initialSelectedTags: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['select-tags', 'cancel-selection']);

// Usamos una ref para manejar la selección interna de los checkboxes
const currentSelectedTags = ref([...props.initialSelectedTags]);

const acceptSelection = () => {
    emit('select-tags', currentSelectedTags.value);
};
</script>