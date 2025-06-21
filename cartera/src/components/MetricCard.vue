<!-- src/components/MetricCard.vue -->
<template>
    <div class="metric-card">
        <div class="metric-value">{{ value }}</div>
        <div class="metric-label">{{ label }}</div>
        <slot name="buttons"></slot>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
    value: {
        type: [String, Number],
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
.metric-card {
    background-color: #5684ba;
    /* Color base de la imagen */
    border-radius: 10px;
    padding: 20px 25px;
    color: white;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    /* Para que ocupe todo el espacio en la grilla */
    min-height: 120px;
    /* Altura mínima */
}

.metric-value {
    font-size: 2.8em;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 5px;
}

.metric-label {
    font-size: 0.9em;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.9;
}

/* Estilos para los botones dentro del slot (si se usan) */
:slotted(.button-group) {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

:slotted(.button-group button) {
    background-color: #6a9ccf;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    color: white;
    font-size: 0.85em;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

:slotted(.button-group button:hover) {
    background-color: #4b7fac;
}
</style>