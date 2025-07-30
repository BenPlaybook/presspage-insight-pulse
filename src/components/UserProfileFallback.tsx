import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const UserProfileFallback = () => {
  const { user, refreshProfile } = useAuthContext();

  const handleRetry = async () => {
    await refreshProfile();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Perfil de Usuario</CardTitle>
        </div>
        <CardDescription>
          No se pudo cargar la información del perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Información del perfil no disponible
            </p>
            <p className="text-sm text-yellow-700">
              El perfil del usuario no se pudo cargar desde la base de datos.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
              {user?.email || 'No disponible'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ID de Usuario</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600 font-mono">
              {user?.id || 'No disponible'}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-1"
            >
              Reintentar
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1"
            >
              Recargar página
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileFallback; 