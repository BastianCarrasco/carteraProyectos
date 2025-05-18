<template>
  <div class="main-layout">
    <div class="left-column">
      <ProjectForm />
    </div>
    <div class="right-column">
      <!-- Espacio reservado para contenido futuro -->
    </div>
  </div>
</template>

<script>
import ProjectForm from '../components/ProjectForm.vue';

export default {
  name: 'MainLayout',
  components: {
    ProjectForm
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