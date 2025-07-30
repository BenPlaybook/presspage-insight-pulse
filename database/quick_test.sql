-- Script de verificación rápida
-- Ejecutar después de fix_406_error.sql

-- 1. Verificar que la tabla existe
SELECT 
    'Tabla users existe' as status,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Verificar que el usuario está en ambas tablas
SELECT 
    'Usuario en auth.users' as source,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'

UNION ALL

SELECT 
    'Usuario en public.users' as source,
    id,
    email,
    created_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 3. Simular la consulta exacta del frontend
-- Esta debería devolver un resultado sin error 406
SELECT 
    'Test de consulta frontend' as status,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 4. Verificar el trigger
SELECT 
    'Trigger status' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Contar usuarios en ambas tablas
SELECT 
    'auth.users count' as table_name, 
    COUNT(*) as count 
FROM auth.users

UNION ALL

SELECT 
    'public.users count' as table_name, 
    COUNT(*) as count 
FROM public.users; 