// exportFunctions.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

export const useExportFunctions = (projects, formatDate, formatCurrency, error) => {

  const unificarAcademicosPorNombre = (proyectos) => {
      const proyectosUnificados = [];
      const nombresProcesados = new Set();

      proyectos.forEach((proyecto) => {
        if (!nombresProcesados.has(proyecto.nombre)) {
          nombresProcesados.add(proyecto.nombre);
          const proyectosMismoNombre = proyectos.filter(
            (p) => p.nombre === proyecto.nombre
          );
          const academicosUnidos = new Set();

          proyectosMismoNombre.forEach((p) => {
            if (p.academico) {
              p.academico.split(",").forEach((acad) => {
                academicosUnidos.add(acad.trim());
              });
            }
          });

          // Crea un nuevo objeto proyecto con los académicos unidos
          proyectosUnificados.push({
            ...proyecto, // Copia las propiedades del primer proyecto
            academico: Array.from(academicosUnidos).join(", "), // Reemplaza los académicos
          });
        }
      });

      return proyectosUnificados;
    };

  const generarPDF = (proyectos) => {
      try {
        if (!proyectos || proyectos.length === 0) {
          error.value = "No hay proyectos para generar el PDF.";
          return;
        }

        const doc = new jsPDF({
          unit: 'mm',
          format: 'letter',
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
            doc.addPage('letter');
            return marginTop;
          }
          return currentY;
        };

        const addTextWithPageCheck = (text, x, y, lineSpacing = 7) => {
          y = checkAddPage(y);
          doc.text(text, x, y);
          return y + lineSpacing;
        };

        doc.setFont('helvetica');
        doc.setTextColor(40);
        doc.setFontSize(16);
        doc.setTextColor(0, 60, 120);
        doc.text('INFORME DETALLADO DE PROYECTOS', pageWidth / 2, marginTop, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, marginTop + 7, { align: 'center' });

        let yPosition = marginTop + 15;
        let proyectosEnPagina = 0;

        proyectos?.forEach((proyecto, index) => {
          if (proyectosEnPagina === 2) {
            doc.addPage('letter');
            doc.setFontSize(16);
            doc.setTextColor(0, 60, 120);
            doc.text('INFORME DETALLADO DE PROYECTOS', pageWidth / 2, marginTop, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, marginTop + 7, { align: 'center' });
            yPosition = marginTop + 15;
            proyectosEnPagina = 0;
          }

          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          const titleLines = doc.splitTextToSize(proyecto.nombre || 'Sin nombre', maxWidth);
          titleLines.forEach((line) => {
            yPosition = checkAddPage(yPosition);
            doc.text(line, marginLeft, yPosition);
            yPosition += 7;
          });

          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          yPosition += 5;

          const datos = [
            `• Facultad: ${proyecto.unidad || 'N/A'}`,
            `• Estatus: ${proyecto.estatus || 'N/A'}`,
            `• Académico responsable: ${proyecto.academico || 'N/A'} ${proyecto.jefe ? '(Jefe de proyecto)' : ''}`,
            `• Monto: ${formatCurrency(proyecto.monto)}`,
            `• Fecha de postulación: ${formatDate(proyecto.fecha_postulacion)}`,
            `• Tipo de convocatoria: ${proyecto.tipo_Convo || 'N/A'}`,
            `• Institución convocante: ${proyecto.inst_convo || 'N/A'}`,
            `• Nombre convocatoria: ${proyecto.tipo_convo || 'N/A'}`,
            `• Tipo de apoyo: ${proyecto.tipo_apoyo || 'N/A'} - ${proyecto.detalle || 'N/A'}`,
            `• Comentarios: ${proyecto.comentarios || 'Ninguno'}`,
          ];

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

        doc.addPage('letter');
        doc.setFontSize(14);
        doc.setTextColor(0, 60, 120);
        doc.text('RESUMEN ESTADÍSTICO', pageWidth / 2, marginTop, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(0);
        yPosition = marginTop + 10;
        yPosition = addTextWithPageCheck(`• Total de proyectos: ${proyectos?.length || 0}`, marginLeft, yPosition);
        const inversionTotal = proyectos?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;
        yPosition = addTextWithPageCheck(`• Inversión total: ${formatCurrency(inversionTotal)}`, marginLeft, yPosition);
        const facultades = {};
        proyectos?.forEach((p) => {
          const facultad = p.unidad || 'Sin Facultad';
          facultades[facultad] = (facultades[facultad] || 0) + 1;
        });
        const numFacultades = Object.keys(facultades).length;
        yPosition = addTextWithPageCheck(`• Total de facultades distintas: ${numFacultades}`, marginLeft, yPosition);

        const facultadesOrdenadas = Object.entries(facultades)
          .sort(([aFac], [bFac]) => aFac.localeCompare(bFac))
          .map(([fac, count]) => ({ facultad: fac, proyectos: count }));
        doc.autoTable({
          startY: yPosition + 5,
          head: [['Facultad', 'Proyectos']],
          body: facultadesOrdenadas.map(f => [f.facultad, f.proyectos]),
          theme: 'grid',
          styles: {
            fontSize: 10,
          },
          headStyles: {
            fillColor: [0, 60, 120],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
          },
        });

      yPosition = doc.autoTable.previous.finalY + 5;

        doc.save('informe_detallado_proyectos.pdf');
      } catch (err) {
        console.error('Error al generar PDF:', err);
        error.value = 'Error al generar el documento';
      }
    };

  const exportarCSV = (proyectos) => {
      try {
        if (!proyectos || proyectos.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }
        const campos = Object.keys(proyectos[0]);
        const csvHeader = campos.join(",") + "\n";

        const csvRows = proyectos.map((proyecto) =>
          campos.map((campo) => {
            const valor = proyecto[campo];
            if (valor === null || valor === undefined) return "";
            const valorString = String(valor).replace(/"/g, '""');
            return `"${valorString}"`;
          }).join(",")
        ).join("\n");

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error al exportar CSV:", err);
        error.value = "Error al exportar el CSV.";
      }
    };

  const exportarExcel = async (proyectos) => {
      try {
        if (!proyectos || proyectos.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Proyectos");
        const campos = Object.keys(proyectos[0]);
        worksheet.addRow(campos);
        proyectos.forEach(proyecto => {
          const fila = campos.map(campo => {
            let valor = proyecto[campo];
            if (valor === null || valor === undefined) {
              valor = '';
            }
            return valor;
          });
          worksheet.addRow(fila);
        });

        worksheet.columns.forEach(column => {
          column.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
           type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a Excel:", err);
        error.value = "Error al exportar a Excel.";
      }
    };

  const exportarTXT = (proyectos) => {
      try {
        if (!proyectos || proyectos.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        const txtContent = proyectos.map(proyecto => {
          return Object.entries(proyecto)
            .map(([key, value]) => `${key}: ${value !== null && value !== undefined ? value : ''}`)
            .join('\n');
        }).join('\n\n');

        const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a TXT:", err);
        error.value = "Error al exportar el TXT.";
      }
    };

    const exportarJSON = (proyectos) => {
      try {
        if (!proyectos || proyectos.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        const jsonContent = JSON.stringify(proyectos, null, 2);

        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a JSON:", err);
        error.value = "Error al exportar a JSON.";
      }
    };


  return {
    unificarAcademicosPorNombre,
    generarPDF,
    exportarCSV,
    exportarExcel,
    exportarTXT,
    exportarJSON,
  };
};