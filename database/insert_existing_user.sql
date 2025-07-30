-- Script para insertar manualmente el usuario existente
-- Basado en el log: id = d65abaa7-b053-4889-8a0b-bbc6abcf6cb6

-- 1. Verificar si el usuario existe en auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 2. Verificar si ya existe en public.users
SELECT id, email, name, created_at 
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 3. Insertar el usuario en public.users si no existe
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
    created_at,
    created_at as updated_at
FROM auth.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'
);

-- 4. Verificar que se insertó correctamente
SELECT id, email, name, created_at, updated_at 
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 5. Crear la función y trigger para futuros usuarios (si no existen)
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

-- 6. Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar que el trigger se creó
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 