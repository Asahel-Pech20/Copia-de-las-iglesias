import { ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermiso } from '@/hooks/usePermiso';
import { CargaLogo } from '../components/CargaLogo';
import { FormGeneral } from '../components/FormGeneral';
import { Horarios } from '../components/Horarios';
import { useConfiguracion } from '../hooks';

export function ConfiguracionPage() {
  const consulta = useConfiguracion();
  const editable = usePermiso('configuracion:editar');

  return (
    <>
      <PageHeader
        titulo="Configuración de la iglesia"
        descripcion={editable ? undefined : 'Solo el administrador puede modificar estos datos.'}
      />
      {consulta.isPending ? (
        <SkeletonTabla filas={4} columnas={2} />
      ) : consulta.isError ? (
        <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
      ) : (
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="logo">Logotipo</TabsTrigger>
            <TabsTrigger value="horarios">Horarios</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardContent className="p-4">
                <FormGeneral config={consulta.data} editable={editable} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="logo">
            <Card>
              <CardContent className="p-4">
                <CargaLogo config={consulta.data} editable={editable} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="horarios">
            <Horarios editable={editable} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
