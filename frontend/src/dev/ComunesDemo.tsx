import { HandCoins, Users } from 'lucide-react';
import { useState } from 'react';
import { BadgeEstado } from '@/components/comunes/BadgeEstado';
import { CampoFecha, CampoMoneda, SelectEnum } from '@/components/comunes/CamposFormulario';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { type Columna, DataTable, type Orden } from '@/components/comunes/DataTable';
import { EmptyState, ErrorState, SkeletonTabla, StatCard } from '@/components/comunes/Estados';
import {
  CampoBusqueda,
  DateRangePicker,
  FiltrosBar,
  type RangoFechas,
} from '@/components/comunes/Filtros';
import { FormField } from '@/components/comunes/FormField';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ETIQUETAS_ROL, formatearFecha, opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Rol } from '@/types/comunes';

interface MiembroDemo {
  id: string;
  nombre: string;
  ingreso: string;
  activo: boolean;
}

const MIEMBROS: MiembroDemo[] = [
  { id: '1', nombre: 'Ana López', ingreso: '2024-03-10', activo: true },
  { id: '2', nombre: 'Luis Pérez', ingreso: '2025-07-01', activo: false },
  { id: '3', nombre: 'María Chan', ingreso: '2023-11-22', activo: true },
];

const COLUMNAS: Columna<MiembroDemo>[] = [
  { clave: 'nombre', encabezado: 'Nombre', celda: (m) => m.nombre, ordenable: true },
  {
    clave: 'fechaIngreso',
    encabezado: 'Ingreso',
    celda: (m) => formatearFecha(m.ingreso),
    ordenable: true,
  },
  { clave: 'activo', encabezado: 'Estado', celda: (m) => <BadgeEstado activo={m.activo} /> },
];

/** Ejemplos de components/comunes para /_dev/ui (F1-06, F1-07). */
export function ComunesDemo() {
  const [q, setQ] = useState('');
  const [orden, setOrden] = useState<Orden>('nombre:asc');
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [rango, setRango] = useState<RangoFechas>({});
  const [rol, setRol] = useState<Rol>();
  const [fecha, setFecha] = useState<string | null>(null);
  const [monto, setMonto] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [pagina, setPagina] = useState(1);

  const [campo, direccion] = orden.split(':');
  const datos = MIEMBROS.filter((m) => m.nombre.toLowerCase().includes(q.toLowerCase())).sort(
    (a, b) => {
      const va = campo === 'nombre' ? a.nombre : a.ingreso;
      const vb = campo === 'nombre' ? b.nombre : b.ingreso;
      return direccion === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    },
  );

  return (
    <section className="flex flex-col gap-6 border-t pt-8">
      <h2 className="text-lg font-semibold">Componentes compartidos (components/comunes)</h2>

      <PageHeader
        titulo="PageHeader"
        descripcion="Título, descripción y acciones."
        acciones={<Button>Nuevo miembro</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard titulo="Miembros activos" valor="120" icono={Users} descripcion="+4 este mes" />
        <StatCard titulo="Ingresos del mes" valor="$15,230.00" icono={HandCoins} />
        <StatCard titulo="Cargando" valor="" cargando />
      </div>

      <FiltrosBar>
        <CampoBusqueda valor={q} alCambiar={setQ} placeholder="Buscar miembro" />
        <DateRangePicker valor={rango} alCambiar={setRango} />
      </FiltrosBar>

      <Card>
        {datos.length === 0 ? (
          <EmptyState icono={Users} titulo="Sin resultados" accion={<Button>Registrar</Button>} />
        ) : (
          <DataTable
            etiqueta="Miembros de ejemplo"
            columnas={COLUMNAS}
            datos={datos}
            obtenerId={(m) => m.id}
            orden={orden}
            alOrdenar={setOrden}
            seleccionados={seleccion}
            alSeleccionar={setSeleccion}
            acciones={() => (
              <Button variante="fantasma" tamano="sm">
                Ver
              </Button>
            )}
          />
        )}
        <Paginacion
          meta={{ page: pagina, limit: 20, total: 45, totalPages: 3 }}
          alCambiarPagina={setPagina}
        />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <SkeletonTabla filas={3} columnas={3} />
        </Card>
        <Card>
          <ErrorState
            error={{
              status: 0,
              code: 'NETWORK_ERROR',
              message: 'No se pudo conectar con el servidor.',
            }}
            alReintentar={() => notificar.info('Reintentando…')}
          />
        </Card>
      </div>

      <Card className="grid max-w-2xl gap-4 p-4 sm:grid-cols-2">
        <FormField label="Nombre" requerido hint="Como aparece en su identificación">
          <Input />
        </FormField>
        <FormField label="Con error" error="Este campo es obligatorio.">
          <Input />
        </FormField>
        <FormField label="Rol (SelectEnum)">
          <SelectEnum opciones={opcionesDe(ETIQUETAS_ROL)} valor={rol} alCambiar={setRol} />
        </FormField>
        <FormField label="Fecha (CampoFecha)">
          <CampoFecha valor={fecha} alCambiar={setFecha} />
        </FormField>
        <FormField label="Monto (CampoMoneda)">
          <CampoMoneda valor={monto} alCambiar={setMonto} />
        </FormField>
        <div className="flex items-end gap-2">
          <Button variante="peligro" onClick={() => setConfirmar(true)}>
            ConfirmDialog con motivo
          </Button>
          <Button variante="contorno" onClick={() => notificar.exito('Miembro guardado')}>
            Toast
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        abierto={confirmar}
        alCambiarAbierto={setConfirmar}
        titulo="Anular donación"
        descripcion="La donación quedará registrada como anulada."
        textoConfirmar="Anular"
        peligro
        motivo="obligatorio"
        alConfirmar={(motivo) => notificar.exito(`Anulada: ${motivo}`)}
      />
    </section>
  );
}
