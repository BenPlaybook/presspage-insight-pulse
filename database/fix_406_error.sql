-- Script para solucionar el error 406
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        -- Crear la tabla si no existe
        CREATE TABLE public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Crear índices
        CREATE INDEX users_email_idx ON public.users(email);
        CREATE INDEX users_created_at_idx ON public.users(created_at);
        
        RAISE NOTICE 'Tabla users creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla users ya existe';
    END IF;
END $$;

-- 2. Verificar si el usuario existe en auth.users
SELECT 
    'Usuario en auth.users' as status,
    id,
    email,
    created_at
FROM auth.users 
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
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- 4. Verificar que se insertó correctamente
SELECT 
    'Usuario en public.users' as status,
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6';

-- 5. Crear función para sincronización automática
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
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger para futuros usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar el trigger
SELECT 
    'Trigger creado' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 8. Verificar el estado final
SELECT 
    'Estado final' as status,
    COUNT(*) as total_users
FROM public.users;

-- 9. Test de consulta (simular la petición del frontend)
SELECT 
    'Test de consulta' as status,
    id,
    email,
    name,
    created_at
FROM public.users 
WHERE id = 'd65abaa7-b053-4889-8a0b-bbc6abcf6cb6'; 