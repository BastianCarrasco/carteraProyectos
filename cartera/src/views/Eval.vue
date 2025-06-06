<template>
  <div class="fondos-container">
    <h1 class="title">Fondos Concursables</h1>

    <!-- Filtros avanzados -->
    <div class="filters-container">
      <div class="filters">
        <div class="filter-group">
          <label>Tipo de Fondo:</label>
          <select v-model="filters.tipoFondo" @change="updateTipoOptions">
            <option :value="null">Todos</option>
            <option v-for="fondo in tiposFondoUnicos" :key="fondo" :value="fondo">{{ fondo }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>TRL:</label>
          <select v-model="filters.trl">
            <option :value="null">Todos</option>
            <option v-for="n in 9" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Vigentes:</label>
          <select v-model="filters.vigente">
            <option :value="null">Todos</option>
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>

        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-redo"></i> Reiniciar
        </button>
      </div>

      <div class="search-box">
        <input v-model="searchText" placeholder="Buscar por nombre o objetivo..." />
        <i class="fas fa-search"></i>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando fondos...
    </div>

    <!-- Resultados -->
    <div v-else>
      <div v-if="filteredFondos.length === 0" class="no-results">
        <i class="fas fa-info-circle"></i> No se encontraron fondos con los filtros seleccionados
      </div>

      <div v-else>
        <div class="results-info">
          Mostrando {{ filteredFondos.length }} de {{ fondos.length }} fondos
        </div>

        <div class="fondos-grid">
          <div v-for="fondo in filteredFondos" :key="fondo.id" class="fondo-card">
            <div class="fondo-header">
              <h2>{{ fondo.nombre }}</h2>
              <span class="fondo-badge" :class="getFondoBadgeClass(fondo['tipo de fondo'])">
                {{ fondo['tipo de fondo'] }}
              </span>
            </div>

            <div class="fondo-meta">
              <div class="meta-item">
                <i class="fa fa-credit-card-alt"></i>
                <span><strong>Financiamiento:</strong> {{ fondo.financiamiento }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span><strong>Duración del Instrumento:</strong> {{ fondo.plazo }}</span>
              </div>
            </div>

            <div class="fondo-dates">
              <div class="date-item">
                <i class="fas fa-play-circle"></i>
                <span><strong>Inicio:</strong> {{ formatDate(fondo.inicio) }}</span>
              </div>
              <div class="date-item">
                <i class="fas fa-flag-checkered"></i>
                <span><strong>Cierre:</strong> {{ formatDate(fondo.cierre) }}</span>
              </div>
            </div>

            <div class="fondo-tags">
              <span v-if="fondo.trl" class="tag trl">TRL {{ fondo.trl }}</span>
              <span v-if="fondo.tipo" class="tag tipo">{{ getTipoName(fondo.tipo) }}</span>
            </div>

            <div class="fondo-content">
              <h3><i class="fas fa-bullseye"></i> Objetivo</h3>
              <p>{{ fondo.objetivo }}</p>

              <div v-if="fondo.req" class="fondo-req">
                <h3><i class="fas fa-clipboard-list"></i> Requisitos</h3>
                <ul>
                  <li v-for="(req, index) in formatReqs(fondo.req)" :key="index">{{ req }}</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/Proyecto_styles/fondos.css'

export default {
  data() {
    return {
      fondos: [],
      loading: true,
      searchText: '',
      filters: {
        tipoFondo: null,
        tipo: null,
        trl: null,
        vigente: null
      },
      tipoNames: {
        1: 'Innovación Productiva',
        4: 'Investigación y Desarrollo',
        5: 'Investigación Académica'
      }
    }
  },
  computed: {
    filteredFondos() {
      return this.fondos.filter(fondo => {
        const matchesSearch = this.searchText === '' ||
          fondo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
          fondo.objetivo.toLowerCase().includes(this.searchText.toLowerCase())

        let vigente = false
        if (fondo.inicio && fondo.cierre) {
          const hoy = new Date()
          const inicio = new Date(fondo.inicio)
          const cierre = new Date(fondo.cierre)
          vigente = hoy >= inicio && hoy <= cierre
        }

        const matchesFilters = (
          (this.filters.tipoFondo === null || fondo['tipo de fondo'] === this.filters.tipoFondo) &&
          (this.filters.tipo === null || fondo.tipo === this.filters.tipo) &&
          (this.filters.trl === null || fondo.trl === this.filters.trl) &&
          (this.filters.vigente === null || vigente === this.filters.vigente)
        )

        return matchesSearch && matchesFilters
      })
    },
    tiposFondoUnicos() {
      return [...new Set(this.fondos.map(f => f['tipo de fondo']))].sort()
    },
    tiposUnicos() {
      return [...new Set(this.fondos.map(f => f.tipo).filter(Boolean))].sort()
    },
    filteredTipos() {
      if (!this.filters.tipoFondo) return this.tiposUnicos
      return [...new Set(
        this.fondos
          .filter(f => f['tipo de fondo'] === this.filters.tipoFondo)
          .map(f => f.tipo)
          .filter(Boolean)
      )].sort()
    }
  },
  methods: {
    async fetchFondos() {
      try {
        const response = await fetch('https://kth2025backend-production.up.railway.app/fondos')
        const data = await response.json()
        this.fondos = data.data || []
      } catch (error) {
        console.error('Error fetching fondos:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'No especificado'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-CL', options)
    },
    formatReqs(reqs) {
      if (!reqs) return []
      return reqs.split(/\n|\d+\./).filter(item => item.trim() !== '')
    },
    getTipoName(tipo) {
      return this.tipoNames[tipo] || `Tipo ${tipo}`
    },
    getFondoBadgeClass(tipoFondo) {
      return {
        'anid-badge': tipoFondo === 'ANID',
        'corfo-badge': tipoFondo === 'CORFO',
        'pucv-badge': tipoFondo === 'Internas PUCV'
      }
    },
    updateTipoOptions() {
      this.filters.tipo = null
    },
    resetFilters() {
      this.filters = {
        tipoFondo: null,
        tipo: null,
        trl: null,
        vigente: null
      }
      this.searchText = ''
    }
  },
  mounted() {
    this.fetchFondos()
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.fondos-container{
    max-width: 100%;
}
</style>
