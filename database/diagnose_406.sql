-- Script de diagnóstico para el error 406
-- Ejecutar esto para entender exactamente qué está pasando

-- 1. Verificar que el usuario existe y tiene datos correctos
SELECT 
    'Diagnóstico del usuario' as test_type,
    id,
    email,
    name,
    created_at,
    updated_at,
    LENGTH(id::text) as id_length,
    LENGTH(email) as email_length
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 2. Verificar si hay caracteres especiales o problemas en los datos
SELECT 
    'Análisis de datos' as test_type,
    id,
    email,
    name,
    CASE 
        WHEN id IS NULL THEN 'ID NULL'
        WHEN email IS NULL THEN 'EMAIL NULL'
        WHEN name IS NULL THEN 'NAME NULL'
        ELSE 'TODOS OK'
    END as data_status,
    CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'UUID válido'
        ELSE 'UUID inválido'
    END as uuid_status
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 3. Verificar si hay múltiples registros con el mismo ID
SELECT 
    'Verificar duplicados' as test_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT email) as unique_emails
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 4. Simular la consulta exacta que está fallando
-- Esta es la consulta que genera el error 406
SELECT 
    'Consulta exacta del frontend' as test_type,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 5. Verificar permisos de la tabla
SELECT 
    'Permisos de tabla' as test_type,
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 6. Verificar si hay triggers que puedan estar interfiriendo
SELECT 
    'Triggers activos' as test_type,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND trigger_schema = 'public';

-- 7. Verificar índices de la tabla
SELECT 
    'Índices de la tabla' as test_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users'
AND schemaname = 'public';

-- 8. Test de consulta con diferentes enfoques
SELECT 
    'Test 1: Consulta básica' as test_type,
    id,
    email
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'

UNION ALL

SELECT 
    'Test 2: Con LIMIT 1' as test_type,
    id,
    email
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
LIMIT 1

UNION ALL

SELECT 
    'Test 3: Con ORDER BY' as test_type,
    id,
    email
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
ORDER BY created_at DESC
LIMIT 1; 