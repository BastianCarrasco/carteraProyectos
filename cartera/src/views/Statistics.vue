<!-- src/App.vue -->
<template>
    <div id="app">
        <DashboardProyectos />
    </div>
</template>

<script setup>
import DashboardProyectos from '../components/DashboardProyectos.vue';
</script>

<style>
body {
    margin: 0;
    padding: 0;
    background-color: #f0f2f5;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #333;
    max-width: 100%;

}

#app {
    /* ... */
}
</style>