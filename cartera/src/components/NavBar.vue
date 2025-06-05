<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="nav-link">
        <font-awesome-icon :icon="faHouse" /> Home
      </router-link>
      <router-link to="/projects" class="nav-link">
        <font-awesome-icon :icon="faProjectDiagram" /> Visualización de
        Proyectos
      </router-link>
      <router-link to="/create" class="nav-link">
        <font-awesome-icon :icon="faPlusCircle" /> Cartera de Proyectos
      </router-link>

      <!-- Menú desplegable -->
      <div class="dropdown">
        <button class="nav-link dropdown-toggle">
          <font-awesome-icon :icon="faChartPie" /> Perfiles de Proyecto
          <font-awesome-icon :icon="faChevronDown" class="dropdown-icon" />
        </button>
        <div class="dropdown-content">
          <router-link to="/statistics" class="dropdown-item">
            <font-awesome-icon :icon="faChartBar" /> Estadísticas </router-link
          >p
          <router-link to="/formularios" class="dropdown-item">
            <font-awesome-icon :icon="faClipboardList" /> Formularios
          </router-link>
          <router-link to="/eval" class="dropdown-item">
            <font-awesome-icon :icon="faMoneyBillWave" /> Fondos
          </router-link>
        </div>
      </div>
    </div>
    <router-link to="/documents" class="nav-link documents-link">
      <font-awesome-icon :icon="faFileAlt" /> Documentos
    </router-link>
  </nav>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHouse,
  faProjectDiagram,
  faPlusCircle,
  faChartBar,
  faFileAlt,
  faChevronDown,
  faChartPie,
  faClipboardList,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #1a2a3a 100%);
  padding: 1rem 1rem;
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
  border: none;
  cursor: pointer;
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

/* Estilos para el menú desplegable */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  color: white;
  background-color: green
}

.dropdown-icon {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-content {
  display: none;
  position: absolute;
  background: linear-gradient(135deg, #2c3e50 0%, #1a2a3a 100%);
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  top: 100%;
  left: 0;
  overflow: hidden;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-item {
  color: white;
  padding: 0.75rem 1rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  padding-left: 1.25rem;
}

.dropdown-item.router-link-active {
  background-color: #42b983;
  font-weight: 600;
}
. @media (max-width: 768px) {
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

  .dropdown {
    width: 100%;
  }

  .dropdown-content {
    position: static;
    width: 100%;
    box-shadow: none;
  }
}
</style>
