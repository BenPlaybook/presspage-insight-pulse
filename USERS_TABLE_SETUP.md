# Configuración de la Tabla Users

## 📋 Descripción

La tabla `users` en el esquema `public` de Supabase almacena información adicional de los usuarios que se registran a través del sistema de autenticación. Esta tabla se sincroniza automáticamente con `auth.users` mediante triggers.

## 🗄️ Estructura de la Tabla

```sql
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- **id**: UUID que referencia `auth.users(id)` - Clave primaria
- **email**: Email del usuario (único)
- **name**: Nombre del usuario (opcional)
- **created_at**: Fecha de creación del registro
- **updated_at**: Fecha de última actualización (se actualiza automáticamente)

## 🔄 Sincronización Automática

### Trigger de Inserción
Cuando un usuario se registra en `auth.users`, automáticamente se crea un registro en `public.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.created_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger de Actualización
El campo `updated_at` se actualiza automáticamente cuando se modifica un registro:

```sql
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 🛡️ Seguridad (RLS)

La tabla tiene Row Level Security habilitado con las siguientes políticas:

- **SELECT**: Los usuarios solo pueden ver su propio perfil
- **UPDATE**: Los usuarios solo pueden actualizar su propio perfil
- **INSERT**: Los usuarios solo pueden insertar su propio perfil

## 🔧 Funcionalidades Implementadas

### 1. Hook useAuth Mejorado
- `user`: Usuario de autenticación (auth.users)
- `userProfile`: Perfil completo del usuario (public.users)
- `updateProfile()`: Actualizar información del perfil
- `refreshProfile()`: Recargar información del perfil

### 2. Servicio userService
- `getCurrentUser()`: Obtener perfil del usuario actual
- `createUser()`: Crear nuevo usuario
- `updateUser()`: Actualizar usuario
- `getUserById()`: Obtener usuario por ID
- `getUserByEmail()`: Obtener usuario por email
- `userExists()`: Verificar si existe un usuario

### 3. Componentes
- `UserProfile`: Componente para mostrar/editar perfil
- `Profile`: Página de perfil del usuario
- Header actualizado para mostrar nombre del usuario

## 🚀 Uso en la Aplicación

### Obtener Información del Usuario
```typescript
const { user, userProfile } = useAuthContext();

// user: Información de autenticación
console.log(user.email);

// userProfile: Información completa del perfil
console.log(userProfile.name);
console.log(userProfile.created_at);
```

### Actualizar Perfil
```typescript
const { updateProfile } = useAuthContext();

await updateProfile({ name: 'Nuevo Nombre' });
```

### Verificar si el Usuario Existe
```typescript
import { userService } from '@/services/userService';

const exists = await userService.userExists(userId);
```

## 📁 Archivos Relacionados

```
src/
├── types/
│   └── users.ts              # Tipos TypeScript
├── services/
│   └── userService.ts        # Servicio para operaciones CRUD
├── hooks/
│   └── useAuth.ts            # Hook mejorado con perfil
├── components/
│   ├── UserProfile.tsx       # Componente de perfil
│   └── Header.tsx            # Header actualizado
├── pages/
│   └── Profile.tsx           # Página de perfil
└── contexts/
    └── AuthContext.tsx       # Contexto actualizado
```

## 🔍 Verificación

Para verificar que todo funciona correctamente:

1. **Registro de Usuario**: Al registrarse, debe crearse automáticamente un registro en `public.users`
2. **Login**: Al hacer login, debe cargarse el perfil del usuario
3. **Actualización**: Los cambios en el perfil deben persistir
4. **Logout**: Al hacer logout, debe limpiarse el perfil

## 🐛 Troubleshooting

### Problema: No se crea el perfil automáticamente
- Verificar que el trigger `on_auth_user_created` esté activo
- Verificar que la función `handle_new_user` tenga permisos SECURITY DEFINER

### Problema: No se puede acceder al perfil
- Verificar las políticas RLS
- Verificar que el usuario esté autenticado

### Problema: Error al actualizar perfil
- Verificar que el usuario tenga permisos de UPDATE
- Verificar que el campo `updated_at` se actualice automáticamente 