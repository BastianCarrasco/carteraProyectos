<template>
  <nav class="navbar">
     <router-link to="/" class="nav-link">Home</router-link>
    <router-link to="/projects" class="nav-link">Proyectos</router-link>
    <router-link to="/create" class="nav-link">Crear</router-link>
    <router-link to="/statistics" class="nav-link">Estadísticas</router-link>
    <router-link to="/documents" class="nav-link">Documentos</router-link>
  </nav>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: #34495e;
}

.router-link-active {
  background-color: #42b983;
  font-weight: bold;
}
</style>