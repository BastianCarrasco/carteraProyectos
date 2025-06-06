<template>
  <div class="home">
    <h1>Bienvenido a la Gestión de Proyectos</h1>
    <p class="subtitle">Una herramienta para organizar y monitorear tus proyectos</p>

    <div class="features">
      <!-- Tarjeta 1: Proyectos -->
      <div class="feature-card">
        <h2>📋 Proyectos</h2>
        <p>Visualiza y gestiona todos tus proyectos en un solo lugar.</p>
        <router-link to="/projects" class="action-button">Ver proyectos</router-link>
      </div>

      <!-- Tarjeta 2: Crear -->
      <div class="feature-card">
        <h2>✨ Crear</h2>
        <p>Agrega nuevos proyectos con un formulario sencillo.</p>
        <router-link to="/create" class="action-button">Crear proyecto</router-link>
      </div>

      <!-- Tarjeta 3: Editar -->
      <div class="feature-card">
        <h2>✏️ Editar</h2>
        <p>Actualiza la información de tus proyectos existentes.</p>
        <router-link to="/edit" class="action-button">Editar proyectos</router-link>
      </div>

      <!-- Tarjeta 4: Estadísticas -->
      <div class="feature-card">
        <h2>📊 Estadísticas</h2>
        <p>Métricas y gráficos para analizar tu productividad.</p>
        <router-link to="/statistics" class="action-button">Ver estadísticas</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.subtitle {
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h2 {
  margin-top: 0;
  color: #2c3e50;
}

.action-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.action-button:hover {
  background: #3aa876;
}
</style>