<template>
  <div class="fondos-container">
    <h1 class="title">Fondos Concursables</h1>

    <!-- Advanced Filters and Search -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="filter-item">
          <label for="tipoFondo">Tipo de Fondo:</label>
          <select id="tipoFondo" v-model="filters.tipoFondo">
            <option :value="null">Todos</option>
            <option v-for="fondoType in tiposFondoUnicos" :key="fondoType" :value="fondoType">
              {{ fondoType }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label for="trl">TRL:</label>
          <select id="trl" v-model="filters.trl">
            <option :value="null">Todos</option>
            <option v-for="n in 9" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="filter-item">
          <label for="vigente">Estado:</label>
          <select id="vigente" v-model="filters.vigente">
            <option :value="null">Todos</option>
            <option :value="true">Vigente</option>
            <option :value="false">Finalizado</option>
          </select>
        </div>

        <button @click="resetFilters" class="reset-btn">
         Reiniciar Filtros
        </button>
      </div>

      <div class="search-box">
        <input v-model="searchText" placeholder="Buscar por nombre o objetivo..." class="search-input" />
        <!-- <i class="fas fa-search search-icon"></i> -->
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando fondos... Por favor, espere.
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> Error al cargar los fondos: {{ error }}
      <p>Por favor, intente recargar la página.</p>
    </div>

    <!-- Results Table -->
    <div v-else>
      <div v-if="filteredFondos.length === 0" class="no-results">
        <i class="fas fa-info-circle"></i> No se encontraron fondos con los filtros o
        búsqueda actuales.
      </div>

      <div v-else>
        <p class="results-summary">
          Mostrando **{{ filteredFondos.length }}** de **{{ fondos.length }}** fondos
          disponibles.
        </p>

        <div class="fondos-table-container">
          <table class="fondos-table">
            <thead>
              <tr>
                <th class="header-icon-col"></th>
                <!-- For expand/collapse icon -->
                <th class="header-name-col">Nombre del Fondo</th>
                <th class="header-type-col">Tipo de Fondo</th>
                <th class="header-trl-col">TRL</th>
                <th class="header-finance-col">Financiamiento</th>
                <th class="header-duration-col">Duración</th>
                <th class="header-status-col">Estado</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="fondo in filteredFondos" :key="fondo.id">
                <tr class="fondo-row" @click="toggleDetails(fondo.id)"
                  :class="{ 'is-expanded': expandedFondoId === fondo.id }"
                  role="button"
                  tabindex="0"
                  :aria-expanded="expandedFondoId === fondo.id ? 'true' : 'false'">
                  <td class="expand-toggle">
                    <!-- <i class="fas fa-chevron-down"
                       :style="{ transform: expandedFondoId === fondo.id ? 'rotate(180deg)' : 'rotate(0deg)' }"></i> -->
                  </td>
                  <td>
                    <div class="fondo-name-cell">
                      <img v-if="getFondoLogo(fondo['tipo de fondo'])" :src="getFondoLogo(fondo['tipo de fondo'])"
                        :alt="fondo['tipo de fondo'] + ' Logo'" class="fondo-logo" />
                      <span class="fondo-name">{{ fondo.nombre }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="getFondoBadgeClass(fondo['tipo de fondo'])">
                      {{ fondo['tipo de fondo'] }}
                    </span>
                  </td>
                  <td>
                    <span v-if="fondo.trl" class="tag-inline trl-tag">
                      TRL {{ fondo.trl }}
                    </span>
                    <span v-else>N/A</span>
                  </td>
                  <td>{{ fondo.financiamiento || 'No especificado' }}</td>
                  <td>{{ fondo.plazo || 'No especificado' }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(isFondoVigente(fondo))">
                      {{ isFondoVigente(fondo) ? 'Vigente' : 'Finalizado' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="expandedFondoId === fondo.id" class="fondo-details-row">
                  <td :colspan="getTableColspan()" :aria-hidden="expandedFondoId !== fondo.id">
                    <div class="details-panel">
                      <div class="detail-section">
                        <h4><i class="fas fa-bullseye icon"></i> Objetivo</h4>
                        <p>
                          {{
                            fondo.objetivo ||
                            'No se ha especificado el objetivo para este fondo.'
                          }}
                        </p>
                      </div>

                      <div v-if="fondo.req && formatReqs(fondo.req).length > 0" class="detail-section">
                        <h4><i class="fas fa-clipboard-list icon"></i> Requisitos</h4>
                        <ul class="requirements-list">
                          <li v-for="(req, index) in formatReqs(fondo.req)" :key="index">
                            {{ req }}
                          </li>
                        </ul>
                      </div>
                      <div v-else class="detail-section no-requirements-details">
                        <p>
                          <i class="fas fa-exclamation-circle icon-small"></i> No hay
                          requisitos detallados disponibles.
                        </p>
                      </div>

                      <div class="detail-section dates-section">
                        <h4><i class="fas fa-calendar-alt icon"></i> Fechas Importantes</h4>
                        <p>
                          <i class="fas fa-play-circle icon-small"></i>
                          <strong>Inicio:</strong>
                          {{ formatDate(fondo.inicio) }}
                        </p>
                        <p>
                          <i class="fas fa-flag-checkered icon-small"></i>
                          <strong>Cierre:</strong>
                          {{ formatDate(fondo.cierre) }}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importa los logos de tus archivos estáticos
import corfoLogo from '../assets/fondos/corfo.png';
import sqmLogo from '../assets/fondos/sqm_logo.jpg';
import anidLogo from '../assets/fondos/anid.jpg';
import pucvLogo from '../assets/fondos/PUCV_Escudo2016.svg';
// Si tienes más logos, impórtalos aquí

export default {
  data() {
    return {
      fondos: [],
      loading: true,
      error: null,
      searchText: '',
      filters: {
        tipoFondo: null, // This will now hold string values like 'ANID', 'CORFO'
        trl: null,
        vigente: null,
      },
      // Mapeo de IDs de tipo a nombres de fondo
      tipoFondoMap: {
        1: 'CORFO',
        4: 'ANID',
        5: 'Internas PUCV', // Agregado basado en tu data de ejemplo
        // Asegúrate de que todos los tipos numéricos de tu backend estén aquí.
        // Si hay otros tipos (ej. 2 para SQM), agrégalos: 2: 'SQM',
      },
      expandedFondoId: null, // Track the currently expanded fondo's ID
      // Mapeo de tipos de fondo a sus logos importados (usa los mismos nombres que en tipoFondoMap)
      fondoLogos: {
        'CORFO': corfoLogo,
        'SQM': sqmLogo, // Si 'SQM' no es un tipo numérico en tu backend, pero sí una categoría, asegúrate de que se mapee aquí si es necesario.
        'ANID': anidLogo,
        'Internas PUCV': pucvLogo,
        // Agrega más mapeos aquí si tienes otros logos: 'Otro Tipo de Fondo': otroLogoImportado,
      },
    };
  },
  computed: {
    filteredFondos() {
      return this.fondos.filter((fondo) => {
        const matchesSearch =
          !this.searchText ||
          fondo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
          fondo.objetivo.toLowerCase().includes(this.searchText.toLowerCase());

        const isVigenteFondo = this.isFondoVigente(fondo);

        const matchesFilters =
          (this.filters.tipoFondo === null ||
            fondo['tipo de fondo'] === this.filters.tipoFondo) && // Uses the new 'tipo de fondo' property
          (this.filters.trl === null || fondo.trl === this.filters.trl) &&
          (this.filters.vigente === null || isVigenteFondo === this.filters.vigente);

        return matchesSearch && matchesFilters;
      });
    },
    tiposFondoUnicos() {
      // Now derived from the 'tipo de fondo' property created in fetchFondos
      return [...new Set(this.fondos.map((f) => f['tipo de fondo']).filter(Boolean))].sort();
    },
  },
  methods: {
    async fetchFondos() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(
          'https://elysia-bunbackend-production.up.railway.app/fondos'
        );
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        const apiData = await response.json();
        // Ensure data.data exists and is an array (the API returns an array directly, not data.data)
        const dataArray = apiData || []; // Adjusted this line based on your provided data structure

        // Mapear los datos para agregar la propiedad 'tipo de fondo' y limpiar otros datos
        this.fondos = dataArray.map(fondo => {
          // Asigna la cadena de texto basada en el mapeo, o 'Desconocido' si no hay mapeo
          fondo['tipo de fondo'] = this.tipoFondoMap[fondo.tipo] || 'Desconocido';

          // Asegúrate de que TRL sea un número, o null si es nulo o no parseable
          if (fondo.trl) {
            fondo.trl = parseInt(fondo.trl, 10);
            if (isNaN(fondo.trl)) {
              fondo.trl = null;
            }
          } else {
            fondo.trl = null; // Si viene como null o undefined, mantenlo como null
          }

          // Si 'req' es null en el backend, conviértelo a un string vacío para formatReqs
          if (fondo.req === null) {
              fondo.req = '';
          }

          // IMPORTANT: Your API data uses "id" as the unique identifier, not "id_fondo".
          // Ensure your v-for key and toggleDetails refer to `fondo.id`.
          // If your backend used `id_fondo`, this would be fine, but it uses `id`.
          // I will assume `id` is the correct unique key.
          return fondo;
        });

      } catch (error) {
        console.error('Error fetching fondos:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'No especificado';
      try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // The `T00:00:00.000Z` indicates UTC. `new Date()` handles this correctly.
        return new Date(dateString).toLocaleDateString('es-CL', options);
      } catch (e) {
        console.warn('Invalid date string:', dateString, e);
        return 'Fecha inválida';
      }
    },
    isFondoVigente(fondo) {
      if (!fondo.inicio || !fondo.cierre) return false;
      const hoy = new Date();
      const inicio = new Date(fondo.inicio);
      const cierre = new Date(fondo.cierre);
      // Adjust close date to end of day for inclusive comparison
      cierre.setHours(23, 59, 59, 999);
      return hoy >= inicio && hoy <= cierre;
    },
    formatReqs(reqs) {
      if (!reqs) return []; // Handles null or undefined reqs
      // Improve splitting for various list formats and empty lines
      return reqs
        .split(/[\r\n]+|\s*-\s*|\s*\d+\.\s*|;\s*|\.\s+/) // Split by new line, hyphen, number. or semicolon, or period followed by space
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && item !== '-'); // Filter out empty strings and lone hyphens
    },
    getFondoBadgeClass(tipoFondo) {
      // Ensure names here match those in tipoFondoMap and fondoLogos
      return {
        'fondo-badge': true,
        'anid-badge': tipoFondo === 'ANID',
        'corfo-badge': tipoFondo === 'CORFO',
        'pucv-badge': tipoFondo === 'Internas PUCV',
        'sqm-badge': tipoFondo === 'SQM', // Added 'SQM' badge class if you use it
        'default-badge': !['ANID', 'CORFO', 'Internas PUCV', 'SQM'].includes(tipoFondo),
      };
    },
    getStatusBadgeClass(isVigente) {
      return {
        'status-badge': true,
        'status-vigente': isVigente,
        'status-finalizado': !isVigente,
      };
    },
    getFondoLogo(tipoFondo) {
      // Returns the logo URL or null if not found
      return this.fondoLogos[tipoFondo] || null;
    },
    resetFilters() {
      this.filters = {
        tipoFondo: null,
        trl: null,
        vigente: null,
      };
      this.searchText = '';
    },
    toggleDetails(fondoId) {
      if (this.expandedFondoId === fondoId) {
        this.expandedFondoId = null; // Colapsar si ya está expandido
      } else {
        this.expandedFondoId = fondoId; // Expandir la fila clickeada
      }
    },
    getTableColspan() {
      return 7; // Número de columnas en el encabezado de la tabla
    },
  },
  mounted() {
    this.fetchFondos();
  },
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* --- General Structure & Typography --- */
.fondos-container {
  max-width: 1300px;
  /* Slightly wider for the table */
  margin: 20px auto;
  padding: 25px;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f9fbfd;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 40px;
  text-align: center;
  color: #2c3e50;
  position: relative;
  padding-bottom: 15px;
}

.title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: #007bff;
  border-radius: 2px;
}

/* --- Filters & Search Section --- */
.filters-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 25px;
  margin-bottom: 40px;
  padding: 25px;
  border-radius: 12px;
  background-color: #eef4f9;
  border: 1px solid #dbe6ee;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  flex-grow: 1;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
  flex: 1;
  /* Allows items to grow/shrink */
}

label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

select,
.search-input {
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid #b7c7d6;
  font-size: 1rem;
  color: #333;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  appearance: none;
  /* Remove default select arrow */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20viewBox%3D%220%200%20292.4%20292.4%22%3E%3Cpath%20fill%3D%22%236c757d%22%20d%3D%22M287%2C116.8l-14.4-14.4c-0.8-0.8-2.2-0.8-3%2C0L146.2%2C248.8L22.8%2C102.4c-0.8-0.8-2.2-0.8-3%2C0L5%2C116.8c-0.8%2C0.8-0.8%2C2.2%2C0%2C3l138.2%2C138.2c0.4%2C0.4%2C1%2C0.6%2C1.5%2C0.6c0.5%2C0%2C1.1-0.2%2C1.5-0.6L287%2C119.8C287.8%2C119%2C287.8%2C117.6%2C287%2C116.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
}

select:focus,
.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
  outline: none;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.reset-btn:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.reset-btn i {
  font-size: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 350px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding-right: 45px;
}

.search-icon {
  position: absolute;
  right: 18px;
  color: #999;
  font-size: 1.2rem;
}

/* --- Status Messages --- */
.loading,
.no-results,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.4rem;
  color: #555;
  background-color: #eaf6fc;
  border-radius: 12px;
  margin-top: 30px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
}

.loading i,
.no-results i,
.error-message i {
  font-size: 3rem;
  margin-bottom: 20px;
  display: block;
  color: #007bff;
}

.error-message {
  background-color: #ffe8e8;
  color: #c0392b;
}

.error-message i {
  color: #c0392b;
}

/* --- Results Summary --- */
.results-summary {
  margin-bottom: 30px;
  font-style: italic;
  color: #666;
  text-align: right;
  padding-right: 15px;
  font-size: 1.1rem;
  font-weight: 500;
}

.results-summary strong {
  color: #333;
  font-weight: 700;
}

/* --- Fondos Table Styles --- */
.fondos-table-container {
  overflow-x: auto;
  /* Enables horizontal scrolling for small screens */
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e6ea;
  padding: 10px;
  /* Some padding around the table */
}

.fondos-table {
  width: 100%;
  border-collapse: separate;
  /* Allows border-radius on cells */
  border-spacing: 0;
  table-layout: fixed;
  /* Ensures consistent column widths */
}

.fondos-table th,
.fondos-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #f0f5f9;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fondos-table th {
  background-color: #f5f8fa;
  font-weight: 700;
  color: #4a6c8e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  /* Makes header sticky if table is in a scrollable container */
  z-index: 1;
  border-top: none;
  /* No top border for th */
}

.fondos-table th:first-child {
  border-top-left-radius: 10px;
}

.fondos-table th:last-child {
  border-top-right-radius: 10px;
}


.fondos-table tbody tr:last-child td {
  border-bottom: none;
}

/* Specific column widths for better layout */
.fondos-table th.header-icon-col {
  width: 40px;
  /* Icon column */
}

.fondos-table th.header-name-col {
  width: 25%;
  /* Nombre del Fondo */
}

.fondos-table th.header-type-col {
  width: 15%;
  /* Tipo de Fondo */
}

.fondos-table th.header-trl-col {
  width: 8%;
  /* TRL */
}

.fondos-table th.header-finance-col {
  width: 18%;
  /* Financiamiento */
}

.fondos-table th.header-duration-col {
  width: 15%;
  /* Duración */
}

.fondos-table th.header-status-col {
  width: 12%;
  /* Estado */
}

/* Row Styling */
.fondo-row {
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.fondo-row:hover {
  background-color: #eef4f9;
}

.fondo-row.is-expanded {
  background-color: #eef4f9;
  border-bottom: none;
  /* No border for the expanded row */
}

/* Expand/Collapse Icon */
.expand-toggle {
  width: 40px;
  /* Fixed width for the icon column */
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

.expand-toggle i {
  color: #007bff;
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.fondo-row.is-expanded .expand-toggle i {
  transform: rotate(180deg);
}

/* Table Cell Content Styles */
.fondo-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  /* Space between the logo and the name */
  white-space: normal;
  /* Allow name to wrap if too long */
}

.fondo-logo {
  width: 30px;
  /* Size of the logo */
  height: 30px;
  object-fit: contain;
  /* Ensures the image is not cropped */
  border-radius: 4px;
  /* Small rounding */
  flex-shrink: 0;
  /* Prevents the logo from shrinking */
  background-color: #ffffff;
  /* Fondo blanco para logos que puedan tener transparencia */
  padding: 2px;
  /* Pequeño padding para el logo */
  border: 1px solid #e0e0e0;
  /* Borde sutil */
}


.fondo-name {
  font-weight: 600;
  color: #2c3e50;
  /* white-space: normal;  Allow name to wrap if too long */
}

/* Badges (Tipo de Fondo) */
.fondo-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  white-space: nowrap;
}

.anid-badge {
  background-color: #e74c3c;
  /* Red */
}

.corfo-badge {
  background-color: #f39c12;
  /* Orange */
  color: #333;
}

.pucv-badge {
  background-color: #3498db;
  /* Blue */
}

/* New badge for SQM if you map it */
.sqm-badge {
  background-color: #2c3e50; /* Darker color for SQM */
  color: white;
}

/* Default badge for unknown types */
.default-badge {
  background-color: #95a5a6; /* Grey */
  color: white;
}


/* Status Badge (Vigente/Finalizado) */
.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  /* Pill shape */
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-vigente {
  background-color: #28a745;
  /* Green */
  color: white;
}

.status-finalizado {
  background-color: #dc3545;
  /* Red */
  color: white;
}

/* Inline Tags (TRL, Categoría - for details) */
.tag-inline {
  display: inline-block;
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background-color: #9e9e9e;
  /* Default */
}

.trl-tag {
  background-color: #4CAF50;
  /* Green */
}

/* --- Expanded Details Panel --- */
.fondo-details-row td {
  padding: 0;
  /* Remove padding from the cell containing the details panel */
  border-top: none;
  /* No top border for the details row */
}

.details-panel {
  background-color: #eef4f9;
  /* Lighter background for details */
  padding: 25px 30px;
  border-top: 1px solid #dbe6ee;
  border-bottom: 1px solid #dbe6ee;
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* Two columns for details on larger screens */
  gap: 25px 30px;
  animation: fadeIn 0.3s ease-out;
  /* Smooth entrance */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-section {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-section h4 {
  font-size: 1.15rem;
  margin: 0 0 12px 0;
  color: #4a6c8e;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.detail-section .icon {
  font-size: 1.15rem;
  color: #007bff;
}

.detail-section p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #444;
  margin: 0;
}

/* Requirements List in Details */
.requirements-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.requirements-list li {
  margin-bottom: 6px;
  padding-left: 25px;
  position: relative;
  line-height: 1.5;
  color: #444;
}

.requirements-list li::before {
  content: '\f00c';
  /* FontAwesome checkmark icon */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  left: 0;
  top: 2px;
  color: #28a745;
  /* Green checkmark */
  font-size: 0.9rem;
}

.no-requirements-details {
  text-align: center;
  background-color: #f8fcfd;
}

.no-requirements-details p {
  font-style: italic;
  color: #777;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-requirements-details .icon-small {
  color: #999;
}

.dates-section {
  grid-column: span 2;
  /* Make dates section span full width in a 2-column grid */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dates-section h4 {
  margin-bottom: 5px;
  /* Adjust margin for dates section header */
}

.dates-section p {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dates-section p strong {
  color: #333;
}

.dates-section .icon-small {
  color: #607d8b;
}

/* --- Responsiveness --- */
@media (max-width: 1024px) {
  .fondos-container {
    max-width: 90%;
  }

  .fondos-table th,
  .fondos-table td {
    padding: 12px 15px;
  }
}

@media (max-width: 768px) {
  .fondos-container {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-item,
  .reset-btn,
  .search-box {
    max-width: none;
    width: 100%;
  }

  .fondos-table th,
  .fondos-table td {
    font-size: 0.85rem;
    padding: 10px 12px;
  }

  /* Table layout for smaller screens - allow auto for more flexibility */
  .fondos-table {
    table-layout: auto;
  }

  /* Hide less critical columns on small screens */
  /* You can uncomment these to hide columns if they don't fit */
  /*
  .fondos-table thead th.header-trl-col,
  .fondos-table tbody td:nth-child(4) {
    display: none;
  }
  */

  /* Keep other columns but make their content wrap if needed */
  .fondos-table th.header-finance-col,
  .fondos-table tbody td:nth-child(5) {
    white-space: normal;
  }

  .fondos-table th.header-duration-col,
  .fondos-table tbody td:nth-child(6) {
    white-space: normal;
  }


  .details-panel {
    grid-template-columns: 1fr;
    /* Single column for details on small screens */
    gap: 20px;
    padding: 20px;
  }

  .dates-section {
    grid-column: span 1;
    /* Reset to single column */
  }
}

@media (max-width: 480px) {
  .fondos-container {
    padding: 10px;
  }

  .title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }

  .filters-section {
    padding: 15px;
    gap: 15px;
  }

  .filter-item label {
    font-size: 0.85rem;
  }

  select,
  .search-input,
  .reset-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .search-icon {
    font-size: 1rem;
    right: 10px;
  }

  .fondos-table th,
  .fondos-table td {
    padding: 8px 10px;
  }

  .fondo-badge,
  .status-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .details-panel {
    padding: 15px;
    gap: 15px;
  }

  .detail-section h4 {
    font-size: 1rem;
  }

  .detail-section p,
  .requirements-list li {
    font-size: 0.85rem;
  }

  .fondo-logo {
    width: 25px;
    /* Slightly smaller logo on very small screens */
    height: 25px;
  }

  .fondo-name-cell {
    gap: 8px;
  }
}
</style>