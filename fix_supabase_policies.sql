-- Script para corregir políticas RLS en Supabase

-- 1. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Allow all operations" ON materiales_mineros;
DROP POLICY IF EXISTS "Enable read access for all users" ON materiales_mineros;
DROP POLICY IF EXISTS "Enable insert for all users" ON materiales_mineros;
DROP POLICY IF EXISTS "Enable update for all users" ON materiales_mineros;
DROP POLICY IF EXISTS "Enable delete for all users" ON materiales_mineros;

-- 2. Crear políticas específicas para cada operación
CREATE POLICY "Enable read access for all users" ON materiales_mineros
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON materiales_mineros
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON materiales_mineros
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON materiales_mineros
FOR DELETE USING (true);

-- 3. Verificar que RLS esté habilitado
ALTER TABLE materiales_mineros ENABLE ROW LEVEL SECURITY;

-- 4. Verificar datos de prueba (opcional)
SELECT * FROM materiales_mineros LIMIT 5;
