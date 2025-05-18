<template>
  <div class="main-layout">
    <div class="left-column">
      <ProjectForm />
    </div>
    <div class="right-column">
      <Conexion />
    </div>
  </div>
</template>

<script>
import ProjectForm from '../components/ProjectForm.vue';
import Conexion from '../components/Connex.vue'; // Asegúrate que el nombre del archivo coincida

export default {
  name: 'MainLayout',
  components: {
    ProjectForm,
    Conexion
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.left-column {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
}

.right-column {
  flex: 1;
  padding: 20px;
  background-color: #fff;
}
</style>