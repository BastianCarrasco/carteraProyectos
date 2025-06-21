<!-- src/components/ValueDisplayCard.vue -->
<template>
    <div class="value-display-card">
        <div class="value-text">{{ value }}</div>
        <div class="value-label">{{ label }}</div>
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
.value-display-card {
    background-color: #5684ba;
    /* Color base */
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
    min-height: 100px;
}

.value-text {
    font-size: 2.5em;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 5px;
}

.value-label {
    font-size: 0.85em;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.9;
}
</style>