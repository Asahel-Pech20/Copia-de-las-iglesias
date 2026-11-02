import { PageHeader } from '@/components/comunes/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { aFechaApi } from '@/lib/formato';
import { HistorialAsistencia } from '../components/HistorialAsistencia';
import { ResumenAsistencia } from '../components/ResumenAsistencia';
import { SeleccionEvento } from '../components/SeleccionEvento';

/** /asistencia: pasar lista (F3-06), historial (F3-08) y resumen (F3-09). Pestaña y filtros en la URL. */
export function AsistenciaPage() {
  const [filtros, setFiltros] = useFiltrosURL({
    tab: 'pasar-lista',
    fecha: aFechaApi(new Date()),
    desde: '',
    hasta: '',
    miembroId: '',
    eventoId: '',
    page: 1,
    periodo: 'semanal',
    ministerioId: '',
  });

  return (
    <>
      <PageHeader titulo="Asistencia" descripcion="Pase de lista, historial y resúmenes." />
      <Tabs value={filtros.tab} onValueChange={(tab) => setFiltros({ tab, desde: '', hasta: '' })}>
        <TabsList className="h-auto">
          <TabsTrigger value="pasar-lista" className="min-h-10">
            Pasar lista
          </TabsTrigger>
          <TabsTrigger value="historial" className="min-h-10">
            Historial
          </TabsTrigger>
          <TabsTrigger value="resumen" className="min-h-10">
            Resumen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pasar-lista">
          <SeleccionEvento
            fecha={filtros.fecha}
            alCambiarFecha={(fecha) => setFiltros({ fecha })}
          />
        </TabsContent>
        <TabsContent value="historial">
          <HistorialAsistencia filtros={filtros} alCambiar={setFiltros} />
        </TabsContent>
        <TabsContent value="resumen">
          <ResumenAsistencia filtros={filtros} alCambiar={setFiltros} />
        </TabsContent>
      </Tabs>
    </>
  );
}
