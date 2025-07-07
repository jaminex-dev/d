-- Crear tabla para materiales mineros
CREATE TABLE materiales_mineros (
    id BIGSERIAL PRIMARY KEY,
    tipo_material VARCHAR(50) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    fecha_modificacion TIMESTAMP
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE materiales_mineros ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations" ON materiales_mineros
FOR ALL USING (true);

-- Opcional: Insertar algunos datos de prueba
INSERT INTO materiales_mineros (tipo_material, peso, fecha_ingreso, ubicacion, descripcion) VALUES
('oro', 125.50, '2024-07-01', 'Mina Norte - Sector A', 'Material de alta pureza'),
('plata', 850.75, '2024-07-02', 'Mina Sur - Nivel 2', 'Plata refinada'),
('cobre', 2340.20, '2024-07-03', 'Almacén Central - Bodega 3', 'Cobre en bruto');
