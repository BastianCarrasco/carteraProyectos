// exportFunctions.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

// Define el orden deseado de las propiedades para todas las exportaciones
const PROJECT_FIELDS_ORDER = [
  "id_proyecto",
  "nombre",
  "estatus",
  "academico_principal",
  "otros_academicos",
  "unidad", // Facultad
  "monto",
  "fecha_postulacion",
  "tipo_convocatoria",
  "nombre_convocatoria",
  "institucion_convocante",
  "tipo_apoyo",
  "detalle_apoyo",
  "tematica",
  "comentarios",
];

/**
 * Función auxiliar para combinar los datos de proyectos y académicos.
 * Esta función es clave para transformar los datos de las APIs
 * a un formato más útil para la exportación.
 * @param {Array} proyectosData - Array de proyectos de la primera URL.
 * @param {Array} academicosPorProyecto - Array de académicos por proyecto de la segunda URL.
 * @returns {Array} Un array de proyectos con la información combinada y estandarizada.
 */
const unificarDatosProyectos = (proyectosData, academicosPorProyecto) => {
  if (!proyectosData || !academicosPorProyecto) {
    return [];
  }

  const academicosMap = new Map();
  academicosPorProyecto.forEach((ap) => {
    academicosMap.set(ap.id_proyecto, ap.profesores);
  });

  return proyectosData.map((proyecto) => {
    const profesores = academicosMap.get(proyecto.id_proyecto) || [];
    const academicoPrincipal =
      profesores.length > 0 ? profesores[0].nombre_completo : "N/A";
    const otrosAcademicos =
      profesores.length > 1
        ? profesores
            .slice(1)
            .map((p) => p.nombre_completo)
            .join(", ")
        : ""; // Cambiado a cadena vacía si no hay otros, para CSV/Excel

    const combinedProject = {};

    const rawProjectData = {
      id_proyecto: proyecto.id_proyecto,
      nombre: proyecto.nombre,
      monto: proyecto.monto,
      fecha_postulacion: proyecto.fecha_postulacion,
      comentarios: proyecto.comentarios,
      tematica: proyecto.tematica,
      estatus: proyecto.estatus,
      tipo_convocatoria: proyecto.convocatoria,
      nombre_convocatoria: proyecto.nombre_convo,
      institucion_convocante: proyecto.institucion,
      tipo_apoyo: proyecto.apoyo,
      detalle_apoyo: proyecto.detalle_apoyo,
      unidad: proyecto.unidad,
      academico_principal: academicoPrincipal,
      otros_academicos: otrosAcademicos,
    };

    PROJECT_FIELDS_ORDER.forEach((key) => {
      let value = rawProjectData[key];
      if (value === undefined || value === null) {
        if (key === "monto") {
          combinedProject[key] = 0;
        } else if (key === "fecha_postulacion") {
          combinedProject[key] = null;
        } else if (key === "otros_academicos") {
          combinedProject[key] = "";
        } else if (key === "comentarios") {
          combinedProject[key] = "Ninguno";
        } else {
          combinedProject[key] = "N/A";
        }
      } else {
        combinedProject[key] = value;
      }
    });

    return combinedProject;
  });
};

export const useExportFunctions = (
  getProyectosData,
  getAcademicosXProyecto,
  formatDate,
  formatCurrency, // Esta función formatCurrency sigue siendo para el formato "$1.234.567"
  errorRef
) => {
  // Nueva función para formatear montos a MM
  const formatMontoMM = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0";
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2); // Divide por 1 millón y redondea a 2 decimales
    }
    return String(amount); // Devuelve el monto original como cadena si es menor a 1 millón
  };

  const generarPDF = async () => {
    try {
      const proyectosData = await getProyectosData();
      const academicosXProyecto = await getAcademicosXProyecto();
      const proyectosCombinados = unificarDatosProyectos(
        proyectosData,
        academicosXProyecto
      );

      if (!proyectosCombinados || proyectosCombinados.length === 0) {
        if (errorRef) errorRef.value = "No hay proyectos para generar el PDF.";
        else alert("No hay proyectos para generar el PDF.");
        return;
      }

      const doc = new jsPDF({
        unit: "mm",
        format: "letter",
      });

      const marginLeft = 15;
      const marginRight = 15;
      const marginTop = 20;
      const marginBottom = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - marginLeft - marginRight;
      const maxYPosition = pageHeight - marginBottom;

      const checkAddPage = (currentY) => {
        if (currentY > maxYPosition) {
          doc.addPage("letter");
          return marginTop;
        }
        return currentY;
      };

      const addTextWithPageCheck = (text, x, y, lineSpacing = 7) => {
        y = checkAddPage(y);
        doc.text(text, x, y);
        return y + lineSpacing;
      };

      doc.setFont("helvetica");
      doc.setTextColor(40);
      doc.setFontSize(16);
      doc.setTextColor(0, 60, 120);
      doc.text("INFORME DETALLADO DE PROYECTOS", pageWidth / 2, marginTop, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generado el ${new Date().toLocaleDateString("es-CL")}`,
        pageWidth / 2,
        marginTop + 7,
        { align: "center" }
      );

      let yPosition = marginTop + 15;

      let proyectosEnPagina = 0;

      proyectosCombinados?.forEach((proyecto) => {
        if (proyectosEnPagina === 2) {
          doc.addPage("letter");
          doc.setFontSize(16);
          doc.setTextColor(0, 60, 120);
          doc.text("INFORME DETALLADO DE PROYECTOS", pageWidth / 2, marginTop, {
            align: "center",
          });

          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(
            `Generado el ${new Date().toLocaleDateString("es-CL")}`,
            pageWidth / 2,
            marginTop + 7,
            { align: "center" }
          );

          yPosition = marginTop + 15;
          proyectosEnPagina = 0;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");

        const titleLines = doc.splitTextToSize(
          proyecto.nombre || "Sin nombre",
          maxWidth
        );
        titleLines.forEach((line) => {
          yPosition = checkAddPage(yPosition);
          doc.text(line, marginLeft, yPosition);
          yPosition += 7;
        });

        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        yPosition += 5;

        // Monto formateado con formatCurrency para el PDF, no formatMontoMM
        // Si quieres el monto en MM en el PDF también, cámbialo aquí.
        const datos = [
          `• Facultad: ${proyecto.unidad}`,
          `• Estatus: ${proyecto.estatus}`,
          `• Académico principal: ${proyecto.academico_principal}`,
          proyecto.otros_academicos && proyecto.otros_academicos !== ""
            ? `• Otros académicos: ${proyecto.otros_academicos}`
            : null,
          `• Monto: ${formatCurrency(proyecto.monto)}`, // Usamos formatCurrency original aquí
          `• Fecha de postulación: ${formatDate(proyecto.fecha_postulacion)}`,
          `• Tipo de convocatoria: ${proyecto.tipo_convocatoria}`,
          `• Nombre convocatoria: ${proyecto.nombre_convocatoria}`,
          `• Institución convocante: ${proyecto.institucion_convocante}`,
          `• Tipo de apoyo: ${proyecto.tipo_apoyo}`,
          `• Detalle de apoyo: ${proyecto.detalle_apoyo}`,
          `• Temática: ${proyecto.tematica}`,
          `• Comentarios: ${proyecto.comentarios}`,
        ].filter(Boolean);

        datos.forEach((linea) => {
          const lines = doc.splitTextToSize(linea, maxWidth);
          lines.forEach((line) => {
            yPosition = checkAddPage(yPosition);
            doc.text(line, marginLeft + 5, yPosition);
            yPosition += 7;
          });
        });

        yPosition = checkAddPage(yPosition + 5);
        doc.setDrawColor(200);
        doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
        yPosition += 10;
        proyectosEnPagina += 1;
      });

      doc.addPage("letter");
      doc.setFontSize(14);
      doc.setTextColor(0, 60, 120);
      doc.text("RESUMEN ESTADÍSTICO", pageWidth / 2, marginTop, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setTextColor(0);
      yPosition = marginTop + 10;

      yPosition = addTextWithPageCheck(
        `• Total de proyectos: ${proyectosCombinados?.length || 0}`,
        marginLeft,
        yPosition
      );

      const inversionTotal =
        proyectosCombinados?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;
      yPosition = addTextWithPageCheck(
        `• Inversión total: ${formatCurrency(inversionTotal)}`,
        marginLeft,
        yPosition
      ); // Aquí también usamos formatCurrency

      const facultades = {};
      proyectosCombinados?.forEach((p) => {
        const facultad = p.unidad || "Sin Facultad";
        facultades[facultad] = (facultades[facultad] || 0) + 1;
      });

      const numFacultades = Object.keys(facultades).length;
      yPosition = addTextWithPageCheck(
        `• Total de facultades distintas: ${numFacultades}`,
        marginLeft,
        yPosition
      );

      const facultadesOrdenadas = Object.entries(facultades)
        .sort(([aFac], [bFac]) => aFac.localeCompare(bFac))
        .map(([fac, count]) => ({ facultad: fac, proyectos: count }));

      doc.autoTable({
        startY: yPosition + 5,
        head: [["Facultad", "Proyectos"]],
        body: facultadesOrdenadas.map((f) => [f.facultad, f.proyectos]),
        theme: "grid",
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fillColor: [0, 60, 120],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: "center" },
        },
      });

      yPosition = doc.autoTable.previous.finalY + 5;

      doc.save("informe_detallado_proyectos.pdf");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      if (errorRef)
        errorRef.value = "Error al generar el documento: " + err.message;
      else alert("Error al generar el documento: " + err.message);
    }
  };

  const exportarCSV = async () => {
    try {
      const proyectosData = await getProyectosData();
      const academicosXProyecto = await getAcademicosXProyecto();
      const proyectosCombinados = unificarDatosProyectos(
        proyectosData,
        academicosXProyecto
      );

      if (!proyectosCombinados || proyectosCombinados.length === 0) {
        if (errorRef) errorRef.value = "No hay proyectos para exportar.";
        else alert("No hay proyectos para exportar.");
        return;
      }

      const campos = PROJECT_FIELDS_ORDER;

      // Actualiza el encabezado para el campo 'monto' en CSV
      const csvHeader =
        campos
          .map((campo) => {
            let header = campo;
            if (campo === "monto") {
              header = "Monto (MM)";
            }
            return `"${header}"`;
          })
          .join(",") + "\n";

      const csvRows = proyectosCombinados
        .map((proyecto) =>
          campos
            .map((campo) => {
              const valor = proyecto[campo];
              let valorString =
                valor === null || valor === undefined ? "" : String(valor);

              if (campo === "fecha_postulacion") {
                valorString = formatDate(valor);
              } else if (campo === "monto") {
                valorString = formatMontoMM(valor); // Usa formatMontoMM aquí
              }

              valorString = valorString.replace(/"/g, '""');
              return valorString.includes(",") ||
                valorString.includes("\n") ||
                valorString.length === 0
                ? `"${valorString}"`
                : valorString;
            })
            .join(",")
        )
        .join("\n");

      const csvContent = csvHeader + csvRows;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "proyectos.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar CSV:", err);
      if (errorRef) errorRef.value = "Error al exportar el CSV: " + err.message;
      else alert("Error al exportar el CSV: " + err.message);
    }
  };

  const exportarExcel = async () => {
    try {
      const proyectosData = await getProyectosData();
      const academicosXProyecto = await getAcademicosXProyecto();
      const proyectosCombinados = unificarDatosProyectos(
        proyectosData,
        academicosXProyecto
      );

      if (!proyectosCombinados || proyectosCombinados.length === 0) {
        if (errorRef) errorRef.value = "No hay proyectos para exportar.";
        else alert("No hay proyectos para exportar.");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Proyectos");

      const campos = PROJECT_FIELDS_ORDER;

      const headerNames = campos.map((key) => {
        const translations = {
          id_proyecto: "ID Proyecto",
          nombre: "Nombre del Proyecto",
          estatus: "Estatus",
          academico_principal: "Académico Principal",
          otros_academicos: "Otros Académicos",
          unidad: "Facultad/Unidad",
          monto: "Monto (MM)", // *** CAMBIO AQUÍ ***
          fecha_postulacion: "Fecha de Postulación",
          tipo_convocatoria: "Tipo de Convocatoria",
          nombre_convocatoria: "Nombre de Convocatoria",
          institucion_convocante: "Institución Convocante",
          tipo_apoyo: "Tipo de Apoyo",
          detalle_apoyo: "Detalle de Apoyo",
          tematica: "Temática",
          comentarios: "Comentarios",
        };
        return (
          translations[key] ||
          key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        );
      });

      worksheet.addRow(headerNames);

      proyectosCombinados.forEach((proyecto) => {
        const fila = campos.map((campo) => {
          let valor = proyecto[campo];
          if (valor === null || valor === undefined) {
            valor = "";
          } else if (campo === "fecha_postulacion") {
            valor = valor ? new Date(valor) : "";
          } else if (campo === "monto") {
            // *** CAMBIO AQUÍ *** Aplicar la lógica de división
            valor = Number(valor);
            if (valor >= 1000000) {
              valor = valor / 1000000; // Divide el valor numérico
            }
          }
          return valor;
        });
        worksheet.addRow(fila);
      });

      proyectosCombinados.forEach((proyecto, rowIndex) => {
        const row = worksheet.getRow(rowIndex + 2);
        campos.forEach((campo, colIndex) => {
          if (campo === "fecha_postulacion") {
            const cell = row.getCell(colIndex + 1);
            cell.numFmt = "dd/mm/yyyy";
          } else if (campo === "monto") {
            const cell = row.getCell(colIndex + 1);
            // *** CAMBIO AQUÍ *** Formato de número para 2 decimales si está en MM
            if (Number(proyecto.monto) >= 1000000) {
              cell.numFmt = "#,##0.00"; // Formato para 2 decimales
            } else {
              cell.numFmt = "#,##0"; // Formato sin decimales para montos pequeños
            }
          }
        });
      });

      worksheet.columns.forEach((column) => {
        let maxColumnLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? String(cell.value) : "";
          const columnLength = cellValue.length;
          if (columnLength > maxColumnLength) {
            maxColumnLength = columnLength;
          }
        });
        column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "proyectos.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar a Excel:", err);
      if (errorRef)
        errorRef.value = "Error al exportar a Excel: " + err.message;
      else alert("Error al exportar a Excel: " + err.message);
    }
  };

  const exportarTXT = async () => {
    try {
      const proyectosData = await getProyectosData();
      const academicosXProyecto = await getAcademicosXProyecto();
      const proyectosCombinados = unificarDatosProyectos(
        proyectosData,
        academicosXProyecto
      );

      if (!proyectosCombinados || proyectosCombinados.length === 0) {
        if (errorRef) errorRef.value = "No hay proyectos para exportar.";
        else alert("No hay proyectos para exportar.");
        return;
      }

      const campos = PROJECT_FIELDS_ORDER;

      const txtContent = proyectosCombinados
        .map((proyecto) => {
          return campos
            .map((key) => {
              let value = proyecto[key];
              let formattedValue =
                value === null || value === undefined ? "" : String(value);

              if (key === "fecha_postulacion") {
                formattedValue = formatDate(value);
              } else if (key === "monto") {
                formattedValue = formatCurrency(value); // Mantener el formato completo para TXT
                // formattedValue = formatMontoMM(value) + (Number(value) >= 1000000 ? ' MM' : ''); // O usar MM
              }

              const displayName = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              if (key === "monto") {
                return `${displayName} (MM): ${formatMontoMM(value)}`; // Título Monto (MM)
              }

              return `${displayName}: ${formattedValue}`;
            })
            .join("\n");
        })
        .join("\n\n--- FIN PROYECTO ---\n\n");

      const blob = new Blob([txtContent], {
        type: "text/plain;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "proyectos.txt");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar a TXT:", err);
      if (errorRef) errorRef.value = "Error al exportar el TXT: " + err.message;
      else alert("Error al exportar el TXT: " + err.message);
    }
  };

  const exportarJSON = async () => {
    try {
      const proyectosData = await getProyectosData();
      const academicosXProyecto = await getAcademicosXProyecto();
      const proyectosCombinados = unificarDatosProyectos(
        proyectosData,
        academicosXProyecto
      );

      if (!proyectosCombinados || proyectosCombinados.length === 0) {
        if (errorRef) errorRef.value = "No hay proyectos para exportar.";
        else alert("No hay proyectos para exportar.");
        return;
      }

      const orderedProjects = proyectosCombinados.map((p) => {
        const orderedP = {};
        PROJECT_FIELDS_ORDER.forEach((key) => {
          if (p.hasOwnProperty(key)) {
            // En JSON, generalmente queremos el valor numérico sin formato para que sea fácil de parsear
            if (key === "monto") {
              orderedP[key] = p[key]; // Mantener el monto original en el JSON
            } else {
              orderedP[key] = p[key];
            }
          }
        });
        return orderedP;
      });

      const jsonContent = JSON.stringify(orderedProjects, null, 2);

      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "proyectos.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar a JSON:", err);
      if (errorRef) errorRef.value = "Error al exportar a JSON: " + err.message;
      else alert("Error al exportar a JSON: " + err.message);
    }
  };

  return {
    generarPDF,
    exportarCSV,
    exportarExcel,
    exportarTXT,
    exportarJSON,
  };
};
