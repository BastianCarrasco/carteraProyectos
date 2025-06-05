<template>
  <div class="proyecto-card">
    <h2>{{ proyecto.nombre || "Proyecto sin nombre" }}</h2>

    <div class="detalle">
      <div><strong>Monto:</strong> {{ formatoMonto(proyecto.monto) }}</div>
      <div>
        <strong>Fecha de Postulación:</strong>
        {{ formatoFecha(proyecto.fecha_postulacion) }}
      </div>
      <div>
        <strong>Comentarios:</strong>
        {{ proyecto.comentarios || "Sin comentarios" }}
      </div>
      <div><strong>Unidad:</strong> {{ nombreUnidad(proyecto.id_unidad) }}</div>
      <div>
        <strong>Convocatoria:</strong>
        {{ nombreConvocatoria(proyecto.id_convocatoria) }}
      </div>
      <div>
        <strong>Temática:</strong> {{ nombreTematica(proyecto.id_tematica) }}
      </div>
      <div>
        <strong>Tipo de Apoyo:</strong> {{ nombreApoyo(proyecto.id_apoyo) }}
      </div>
      <div>
        <strong>Estatus:</strong> {{ nombreEstatus(proyecto.id_estatus) }}
      </div>
      <div>
        <div>
          <strong>Académico(s):</strong>
          {{ nombreAcademico(proyecto.academicos) }}
        </div>
      </div>
    </div>
    <button @click="crearProyecto" class="crear-proyecto-btn">
      Crear Proyecto en Backend
    </button>

    <!-- Mensaje de respuesta -->
    <div v-if="respuestaBackend" class="respuesta-backend">
      <strong>Respuesta del backend:</strong> {{ respuestaBackend }}
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorBackend" class="error-backend">
      <strong>Error:</strong> {{ errorBackend }}
    </div>
  </div>
</template>

<script>
import {
  fetchTematicas,
  fetchEstatus,
  fetchConvocatorias,
  fetchUA,
  fetchApoyos,
  fetchAcademicos,
} from "../plugins/useSistemaData.js";

import "../assets/Proyecto_styles/Fila3.css";

export default {
  props: {
    proyecto: {
      type: Object,
      default: () => ({
        nombre: "",
        monto: null,
        fecha_postulacion: null,
        comentarios: "",
        id_unidad: null,
        id_convocatoria: null,
        id_tematica: null,
        id_apoyo: null,
        id_estatus: null,
        id_academico: [], // CAMBIO: arreglo en lugar de valor único
      }),
    },
  },
  data() {
    return {
      tematicas: [],
      estatusList: [],
      convocatorias: [],
      uaList: [],
      apoyos: [],
      academicos: [],
      respuestaBackend: null,
      errorBackend: null,
      isLoading: false,
    };
  },
  async created() {
    try {
      const [temas, estatus, convocs, ua, apoyo, acads] = await Promise.all([
        fetchTematicas(),
        fetchEstatus(),
        fetchConvocatorias(),
        fetchUA(),
        fetchApoyos(),
        fetchAcademicos(),
      ]);

      this.tematicas = temas.data || temas;
      this.estatusList = estatus.data || estatus;
      this.convocatorias = convocs.data || convocs;
      this.uaList = ua.data || ua;
      this.apoyos = apoyo.data || apoyo;
      this.academicos = acads.data || acads;
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  },
  methods: {
    formatoMonto(monto) {
      if (monto === null || monto === undefined) return "No especificado";
      const numero = Number(monto) / 1000000;
      if (numero === 1) {
        return "1 millón de pesos";
      }
      return `${
        numero % 1 === 0 ? numero : numero.toLocaleString("es-CL")
      } millones de pesos`;
    },
    formatoFecha(fecha) {
      if (!fecha) return "Sin fecha";
      try {
        const opciones = { year: "numeric", month: "long", day: "numeric" };
        return new Date(fecha).toLocaleDateString("es-CL", opciones);
      } catch {
        return "Fecha inválida";
      }
    },
    nombreUnidad(id) {
      if (!id) return "No asignada";
      const unidad = this.uaList.find((u) => u.id_unidad === id);
      return unidad ? unidad.nombre : `ID ${id}`;
    },
    nombreConvocatoria(id) {
      if (!id) return "No asignada";
      const convocatoria = this.convocatorias.find((c) => c.id === id);
      return convocatoria
        ? `${convocatoria.convocatoria} (${convocatoria.tipo})`
        : `ID ${id}`;
    },
    nombreTematica(id) {
      if (!id) return "No asignada";
      const tematica = this.tematicas.find((t) => t.id_tematica === id);
      return tematica ? tematica.nombre : `ID ${id}`;
    },
    nombreApoyo(id) {
      if (!id) return "No asignado";
      const apoyo = this.apoyos.find((a) => a.id_apoyo === id);
      return apoyo ? `${apoyo.tipo} - ${apoyo.detalle}` : `ID ${id}`;
    },
    nombreEstatus(id) {
      if (!id) return "No asignado";
      const estatus = this.estatusList.find((e) => e.id_estatus === id);
      return estatus ? estatus.tipo : `ID ${id}`;
    },
    nombreAcademico(ids) {
      if (!Array.isArray(ids) || ids.length === 0) return "No asignado";

      const nombres = ids
        .filter((id) => id) // elimina nulos o vacíos
        .map((id) => {
          const acad = this.academicos.find((a) => a.id_academico === id);
          return acad ? `${acad.nombre} ${acad.a_paterno}` : `ID ${id}`;
        });

      return nombres.length ? nombres.join(", ") : "No asignado";
    },
  async crearProyecto() {
    this.isLoading = true;
    this.errorBackend = null;
    this.respuestaBackend = null;

    try {
      // 1. Primero creamos el proyecto
      const proyectoData = {
        nombre: this.proyecto.nombre,
        monto: this.proyecto.monto,
        fecha_postulacion: this.proyecto.fecha_postulacion,
        comentarios: this.proyecto.comentarios,
        unidad: this.proyecto.id_unidad,
        id_convocatoria: this.proyecto.id_convocatoria,
        id_tematica: this.proyecto.id_tematica,
        id_apoyo: this.proyecto.id_apoyo,
        id_estatus: this.proyecto.id_estatus,
        id_kth: null
      };

      // Crear el proyecto
      const proyectoResponse = await fetch(
        "https://kth2025backend-production.up.railway.app/proyectos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proyectoData),
        }
      );

      if (!proyectoResponse.ok) {
        const errorData = await proyectoResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${proyectoResponse.status}`);
      }

      const proyectoResponseData = await proyectoResponse.json();
      const idProyecto = proyectoResponseData.data?.id_proyecto;
      
      if (!idProyecto) {
        throw new Error("El backend no devolvió un ID de proyecto válido");
      }

      this.respuestaBackend = `Proyecto creado con ID: ${idProyecto}`;

      // 2. Luego asociamos los académicos al proyecto
      if (Array.isArray(this.proyecto.academicos) && this.proyecto.academicos.length > 0) {
        try {
          // Preparamos todas las peticiones para asociar académicos
          const asociaciones = this.proyecto.academicos.map(async (idAcademico) => {
            const academicoData = {
              id_proyecto: idProyecto,
              id_academico: idAcademico,
              jefe: 1 // Siempre 1 como especificaste
            };

            const response = await fetch(
              "https://kth2025backend-production.up.railway.app/proyecto-academico",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(academicoData),
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`Error asociando académico ${idAcademico}: ${errorData.message || response.status}`);
            }

            return response.json();
          });

          // Esperamos a que todas las asociaciones se completen
          await Promise.all(asociaciones);
          this.respuestaBackend += ". Académicos asociados correctamente.";
        } catch (error) {
          console.error("Error asociando académicos:", error);
          this.respuestaBackend += `. Pero hubo un error asociando académicos: ${error.message}`;
        }
      } else {
        this.respuestaBackend += ". No hay académicos para asociar.";
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      this.errorBackend = error.message || "Error al crear el proyecto";
    } finally {
      this.isLoading = false;
    }
  }
}
};
</script>
 

<style scoped>
.crear-proyecto-btn {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.crear-proyecto-btn:hover {
  background-color: #45a049;
}

.crear-proyecto-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.respuesta-backend {
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.error-backend {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #c62828;
}
</style>
