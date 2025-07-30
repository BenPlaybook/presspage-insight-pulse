import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, Save, X } from 'lucide-react';
import UserProfileFallback from './UserProfileFallback';

const UserProfile = () => {
  const { userProfile, updateProfile, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Actualizar el nombre cuando cambie el perfil
  React.useEffect(() => {
    setName(userProfile?.name || '');
  }, [userProfile?.name]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({ name: name.trim() });
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(userProfile?.name || '');
    setIsEditing(false);
    setError('');
  };

  const handleEdit = () => {
    setName(userProfile?.name || '');
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  if (!userProfile) {
    return <UserProfileFallback />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Perfil de Usuario</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
        <CardDescription>
          Información de tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userProfile.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="name">Nombre</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre"
              />
            ) : (
              <Input
                id="name"
                value={userProfile.name || 'No especificado'}
                disabled
                className="bg-gray-50"
              />
            )}
          </div>

          <div>
            <Label>Fecha de registro</Label>
            <Input
              value={new Date(userProfile.created_at).toLocaleDateString('es-ES')}
              disabled
              className="bg-gray-50"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile; 