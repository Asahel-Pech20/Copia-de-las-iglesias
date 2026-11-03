import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { usePermiso } from '@/hooks/usePermiso';
import { notificar } from '@/lib/notificar';
import type { Donacion } from '@/types/donaciones';
import { AportacionesTab } from '../components/AportacionesTab';
import { DonacionDetalleDialog } from '../components/DonacionDetalleDialog';
import { DonacionFormDialog } from '../components/DonacionFormDialog';
import { ResumenIngresosTab } from '../components/ResumenIngresosTab';
import { ResumenMensualTab } from '../components/ResumenMensualTab';
import { nombreDonante } from '../formato';
import { useAnularDonacion } from '../hooks';

type Pestana = 'aportaciones' | 'resumen' | 'mensual';

/** /donaciones: aportaciones, resumen por periodo y resumen mensual (F4-01 … F4-05). */
export function DonacionesPage() {
  const [filtros, setFiltros] = useFiltrosURL({ tab: 'aportaciones' });
  const pestana = filtros.tab as Pestana;
  const puedeCrear = usePermiso('donaciones:crear');
  const [formulario, setFormulario] = useState<{ abierto: boolean; donacion?: Donacion }>({
    abierto: false,
  });
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [porAnular, setPorAnular] = useState<Donacion | null>(null);
  const anular = useAnularDonacion();

  return (
    <>
      <PageHeader
        titulo="Donaciones"
        descripcion="Aportaciones económicas, ingresos por periodo y resumen mensual."
        acciones={
          puedeCrear && (
            <Button onClick={() => setFormulario({ abierto: true })}>
              <Plus aria-hidden /> Registrar aportación
            </Button>
          )
        }
      />
      <Tabs value={pestana} onValueChange={(tab) => setFiltros({ tab })}>
        <TabsList className="mb-4 h-auto">
          <TabsTrigger value="aportaciones" className="min-h-10">
            Aportaciones
          </TabsTrigger>
          <TabsTrigger value="resumen" className="min-h-10">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="mensual" className="min-h-10">
            <span className="sm:hidden">Mensual</span>
            <span className="hidden sm:inline">Resumen mensual</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="aportaciones">
          <AportacionesTab
            alVer={setDetalleId}
            alRegistrar={() => setFormulario({ abierto: true })}
          />
        </TabsContent>
        <TabsContent value="resumen">
          <ResumenIngresosTab />
        </TabsContent>
        <TabsContent value="mensual">
          <ResumenMensualTab />
        </TabsContent>
      </Tabs>

      <DonacionDetalleDialog
        id={detalleId}
        alCerrar={() => setDetalleId(null)}
        alEditar={(donacion) => {
          setDetalleId(null);
          setFormulario({ abierto: true, donacion });
        }}
        alAnular={(donacion) => {
          setDetalleId(null);
          setPorAnular(donacion);
        }}
      />
      <DonacionFormDialog
        donacion={formulario.donacion}
        abierto={formulario.abierto}
        alCambiarAbierto={(abierto) => setFormulario((f) => ({ ...f, abierto }))}
      />
      <ConfirmDialog
        abierto={porAnular !== null}
        alCambiarAbierto={(abierto) => !abierto && setPorAnular(null)}
        titulo="Anular aportación"
        descripcion={
          porAnular
            ? `La aportación de ${nombreDonante(porAnular)} dejará de sumar en los totales. No se borra: queda registrada con su motivo.`
            : undefined
        }
        textoConfirmar="Anular"
        peligro
        motivo="obligatorio"
        alConfirmar={async (motivo) => {
          if (!porAnular || !motivo) return;
          await anular.mutateAsync({ id: porAnular.id, motivo });
          notificar.exito('Aportación anulada');
        }}
      />
    </>
  );
}
