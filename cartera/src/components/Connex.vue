<template>
  <div class="projects">
    <h1>Lista de Proyectos</h1>
    <!-- El contenido visual se manejará después -->
  </div>
</template>

<script>
export default {
  name: 'ProjectsView',
  data() {
    return {
      proyectos: [],
      links: []
    }
  },
  async created() {
    try {
      // Obtener datos de proyectos
      const proyectosResponse = await fetch('https://kth2025backend-production.up.railway.app/proyectos');
      const proyectosData = await proyectosResponse.json();
      this.proyectos = proyectosData.data;
      console.log('Datos de proyectos:', this.proyectos);

      // Obtener datos de links
      const linksResponse = await fetch('https://kth2025backend-production.up.railway.app/links');
      const linksData = await linksResponse.json();
      this.links = linksData.data;
      console.log('Datos de links:', this.links);

    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }
}
</script>