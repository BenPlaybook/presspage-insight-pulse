-- Script para verificar que la solución funciona
-- Ejecutar después de los cambios en el código

-- 1. Verificar que el usuario existe y tiene todos los datos necesarios
SELECT 
    'Usuario verificado' as status,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 2. Simular la consulta exacta que debería funcionar ahora
-- (sin .single(), solo con .limit(1))
SELECT 
    'Consulta optimizada' as status,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
LIMIT 1;

-- 3. Verificar que no hay duplicados
SELECT 
    'Verificación de duplicados' as status,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 4. Verificar que la tabla tiene la estructura correcta
SELECT 
    'Estructura de tabla' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Test de rendimiento
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, email, name, created_at, updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
LIMIT 1; 