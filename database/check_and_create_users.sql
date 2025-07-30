-- Script para verificar y crear la tabla users
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Verificar si la tabla existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Si no existe, crear la tabla
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar que se creó
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 4. Insertar el usuario existente manualmente
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
    created_at,
    created_at as updated_at
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar que se insertó
SELECT id, email, name, created_at 
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 6. Crear función para futuros usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.created_at,
        NEW.created_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Verificar el trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 