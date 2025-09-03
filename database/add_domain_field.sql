-- Agregar campo domain a la tabla users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS domain TEXT;

-- Crear índice para el campo domain
CREATE INDEX IF NOT EXISTS users_domain_idx ON public.users(domain);

-- Actualizar usuarios existentes con el dominio extraído de su email
UPDATE public.users 
SET domain = CASE 
  WHEN email LIKE '%@%' THEN 
    CASE 
      WHEN email LIKE '%@https://%' THEN 
        REPLACE(REPLACE(SUBSTRING(email FROM '@https://'), 'https://', ''), '/', '')
      WHEN email LIKE '%@http://%' THEN 
        REPLACE(REPLACE(SUBSTRING(email FROM '@http://'), 'http://', ''), '/', '')
      ELSE 
        SUBSTRING(email FROM '@' || (SELECT string_to_array(email, '@')[2]))
    END
  ELSE NULL
END
WHERE domain IS NULL;

-- Comentario sobre el campo domain
COMMENT ON COLUMN public.users.domain IS 'Company domain extracted from user email or manually set';
