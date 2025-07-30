-- Script para probar la consulta exacta que está fallando
-- Basado en el log: GET /rest/v1/users?select=*&id=eq.d65abaa7-b053-4889-8a0b-bbc6abcf6cb6

-- 1. Verificar que el usuario existe en ambas tablas
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'

UNION ALL

SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 2. Simular la consulta exacta del frontend (sin .single())
SELECT 
    'Consulta sin .single()' as test_type,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 3. Verificar si hay múltiples registros (que causarían 406 con .single())
SELECT 
    'Verificar duplicados' as test_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 4. Verificar la estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Verificar restricciones de la tabla
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 6. Test de consulta con LIMIT 1 (como en el código)
SELECT 
    'Test con LIMIT 1' as test_type,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
LIMIT 1; 