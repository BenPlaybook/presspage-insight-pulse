# Solución para Error 406 - Tabla Users

## 🔍 **Problema Identificado**

El error 406 ocurre porque:
1. **Header Accept**: `application/vnd.pgrst.object+json` espera un objeto único
2. **Tabla inexistente**: La tabla `public.users` no existe o no tiene datos
3. **Consulta con `.single()`**: Supabase usa este header automáticamente

## 🚀 **Pasos para Solucionar**

### 1. **Ejecutar Script SQL en Supabase**

Ve a tu dashboard de Supabase → SQL Editor y ejecuta el script `database/fix_406_error.sql`

### 2. **Verificar que la tabla se creó**

```sql
SELECT * FROM public.users WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';
```

## 🚀 **Pasos para Solucionar**

### 1. **Ejecutar Script SQL en Supabase**

Ve a tu dashboard de Supabase → SQL Editor y ejecuta el script `database/check_and_create_users.sql`

### 2. **Verificar que la tabla se creó**

```sql
SELECT * FROM public.users WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';
```

### 3. **Si el script no funciona, crear manualmente**

```sql
-- Crear tabla
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuario existente
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
    id,
    email,
    split_part(email, '@', 1) as name,
    created_at,
    created_at as updated_at
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';
```

## 🔧 **Cambios Realizados en el Código**

### 1. **Hook useAuth Mejorado**
- ✅ Manejo de errores mejorado
- ✅ No entra en loop infinito
- ✅ Continúa sin perfil si hay error

### 2. **Servicio userService Mejorado**
- ✅ Usa `.maybeSingle()` en lugar de `.single()` para evitar 406
- ✅ Verifica existencia de tabla antes de consultar
- ✅ Maneja tabla inexistente
- ✅ Retorna null en lugar de fallar

### 3. **Componente UserProfileFallback**
- ✅ Muestra información básica del usuario
- ✅ Botón para reintentar
- ✅ Botón para recargar página

## 🎯 **Resultado Esperado**

Después de ejecutar el script SQL:

1. ✅ La tabla `public.users` existirá
2. ✅ El usuario estará en ambas tablas
3. ✅ El error 406 desaparecerá
4. ✅ La aplicación cargará normalmente
5. ✅ El perfil del usuario se mostrará correctamente

## 🐛 **Si el problema persiste**

### Verificar en Supabase:
1. **Table Editor** → Verificar que `users` existe en `public`
2. **SQL Editor** → Ejecutar: `SELECT COUNT(*) FROM public.users;`
3. **Logs** → Verificar que no hay más errores 406

### Verificar en el navegador:
1. **Console** → Verificar que no hay errores de red
2. **Network** → Verificar que las peticiones a `/rest/v1/users` devuelven 200

## 📝 **Comandos de Verificación**

```sql
-- Verificar tabla
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
);

-- Verificar usuario
SELECT * FROM public.users WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- Verificar trigger
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
``` 