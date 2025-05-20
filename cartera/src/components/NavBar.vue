<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="nav-link">
        <font-awesome-icon :icon="faHouse" /> Home
      </router-link>
      <router-link to="/projects" class="nav-link">
        <font-awesome-icon :icon="faProjectDiagram" /> Proyectos
      </router-link>
      <router-link to="/create" class="nav-link">
        <font-awesome-icon :icon="faPlusCircle" /> Crear
      </router-link>
      <router-link to="/statistics" class="nav-link">
        <font-awesome-icon :icon="faChartBar" /> Estadísticas
      </router-link>
      <router-link to="/formularios" class="nav-link">
        <font-awesome-icon :icon="faChartBar" /> Formularios
      </router-link>

      <router-link to="/evaluacion" class="nav-link">
        <font-awesome-icon :icon="faChartBar" /> Evaluación
      </router-link>


    </div>
    <router-link to="/documents" class="nav-link documents-link">
      <font-awesome-icon :icon="faFileAlt" /> Documentos
    </router-link>
  </nav>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faHouse,
  faProjectDiagram,
  faPlusCircle,
  faChartBar,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons'
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #1a2a3a 100%);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-left {
  display: flex;
  gap: 1.25rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.25s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  backdrop-filter: blur(2px);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.router-link-active {
  background-color: #42b983;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.3);
}

.documents-link {
  background: linear-gradient(135deg, #ff7b25 0%, #ff5e00 100%);
  padding: 0.75rem 1.75rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(255, 123, 37, 0.3);
}

.documents-link:hover {
  background: linear-gradient(135deg, #ff6a00 0%, #ff4d00 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 106, 0, 0.4);
}

.router-link-active.documents-link {
  background: linear-gradient(135deg, #ff6a00 0%, #ff4d00 100%);
  box-shadow: 0 6px 20px rgba(255, 106, 0, 0.5);
}

.nav-link svg {
  transition: all 0.25s ease-out;
  width: 1em;
  height: 1em;
}

.nav-link:hover svg {
  transform: scale(1.15);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
  }

  .nav-left {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .nav-link,
  .documents-link {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }

  .documents-link {
    margin-top: 0.5rem;
  }
}
</style>