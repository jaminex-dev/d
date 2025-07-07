// Configuración de Base de Datos con Supabase
class DatabaseManager {
    constructor() {
        // Configuración de Supabase
        this.supabaseUrl = 'https://lpqjkdsxhwlfpscclsth.supabase.co'; // Tu URL de Supabase
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcWprZHN4aHdsZnBzY2Nsc3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTU1NTksImV4cCI6MjA2NzQ3MTU1OX0.pYYbWlVprXrN8wG13ZK-zC2ck5sjPeLDduS9If-P9DQ'; // Tu clave API
        this.tableName = 'materiales_mineros';
        this.isOnline = false;
        this.initialized = false;
    }

    // Inicializar conexión a Supabase
    async initialize() {
        try {
            // Verificar si las credenciales están configuradas
            if (this.supabaseUrl === 'TU_SUPABASE_URL' || this.supabaseKey === 'TU_SUPABASE_ANON_KEY') {
                console.warn('Base de datos no configurada. Usando localStorage como respaldo.');
                this.isOnline = false;
                this.initialized = true;
                return false;
            }

            // Verificar conexión
            const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                this.isOnline = true;
                this.initialized = true;
                console.log('Conexión a Supabase establecida');
                return true;
            } else {
                throw new Error('Error de conexión');
            }
        } catch (error) {
            console.error('Error al conectar con Supabase:', error);
            this.isOnline = false;
            this.initialized = true;
            return false;
        }
    }

    // Convertir de camelCase a snake_case para Supabase
    toSnakeCase(obj) {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            converted[snakeKey] = value;
        }
        return converted;
    }

    // Convertir de snake_case a camelCase para JavaScript
    toCamelCase(obj) {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            converted[camelKey] = value;
        }
        return converted;
    }

    // Obtener todos los materiales
    async getMaterials() {
        if (!this.initialized) await this.initialize();

        if (!this.isOnline) {
            return this.getLocalMaterials();
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?select=*&order=id.desc`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                const materials = await response.json();
                return materials.map(material => this.toCamelCase(material));
            } else {
                throw new Error('Error al obtener materiales');
            }
        } catch (error) {
            console.error('Error al obtener materiales:', error);
            return this.getLocalMaterials();
        }
    }

    // Agregar nuevo material
    async addMaterial(material) {
        if (!this.initialized) await this.initialize();

        if (!this.isOnline) {
            return this.addLocalMaterial(material);
        }

        try {
            // Convertir camelCase a snake_case para Supabase
            const snakeCaseMaterial = this.toSnakeCase(material);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(snakeCaseMaterial)
            });

            if (response.ok) {
                const newMaterial = await response.json();
                // Convertir la respuesta de vuelta a camelCase
                return this.toCamelCase(newMaterial[0]);
            } else {
                throw new Error('Error al agregar material');
            }
        } catch (error) {
            console.error('Error al agregar material:', error);
            return this.addLocalMaterial(material);
        }
    }

    // Actualizar material existente
    async updateMaterial(id, material) {
        if (!this.initialized) await this.initialize();

        if (!this.isOnline) {
            return this.updateLocalMaterial(id, material);
        }

        try {
            const snakeCaseMaterial = this.toSnakeCase(material);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(material)
            });

            if (response.ok) {
                const updatedMaterial = await response.json();
                // Convertir la respuesta de vuelta a camelCase
                return this.toCamelCase(updatedMaterial[0]);
            } else {
                throw new Error('Error al actualizar material');
            }
        } catch (error) {
            console.error('Error al actualizar material:', error);
            return this.updateLocalMaterial(id, material);
        }
    }

    // Eliminar material
    async deleteMaterial(id) {
        if (!this.initialized) await this.initialize();

        if (!this.isOnline) {
            return this.deleteLocalMaterial(id);
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                throw new Error('Error al eliminar material');
            }
        } catch (error) {
            console.error('Error al eliminar material:', error);
            return this.deleteLocalMaterial(id);
        }
    }

    // Métodos de respaldo con localStorage
    getLocalMaterials() {
        try {
            const materials = localStorage.getItem('materialMineroData');
            return materials ? JSON.parse(materials) : [];
        } catch (error) {
            console.error('Error al obtener datos locales:', error);
            return [];
        }
    }

    addLocalMaterial(material) {
        try {
            const materials = this.getLocalMaterials();
            const newMaterial = {
                ...material,
                id: Date.now(),
                fechaRegistro: new Date().toISOString()
            };
            materials.push(newMaterial);
            localStorage.setItem('materialMineroData', JSON.stringify(materials));
            return newMaterial;
        } catch (error) {
            console.error('Error al agregar material local:', error);
            return null;
        }
    }

    updateLocalMaterial(id, material) {
        try {
            const materials = this.getLocalMaterials();
            const index = materials.findIndex(m => m.id === id);
            if (index !== -1) {
                materials[index] = {
                    ...materials[index],
                    ...material,
                    fechaModificacion: new Date().toISOString()
                };
                localStorage.setItem('materialMineroData', JSON.stringify(materials));
                return materials[index];
            }
            return null;
        } catch (error) {
            console.error('Error al actualizar material local:', error);
            return null;
        }
    }

    deleteLocalMaterial(id) {
        try {
            const materials = this.getLocalMaterials();
            const filteredMaterials = materials.filter(m => m.id !== id);
            localStorage.setItem('materialMineroData', JSON.stringify(filteredMaterials));
            return true;
        } catch (error) {
            console.error('Error al eliminar material local:', error);
            return false;
        }
    }

    // Sincronizar datos locales con Supabase
    async syncToCloud() {
        if (!this.isOnline) return false;

        try {
            const localMaterials = this.getLocalMaterials();
            const cloudMaterials = await this.getMaterials();

            // Identificar materiales locales que no están en la nube
            const localOnlyMaterials = localMaterials.filter(local => 
                !cloudMaterials.some(cloud => cloud.id === local.id)
            );

            // Subir materiales locales a la nube
            for (const material of localOnlyMaterials) {
                await this.addMaterial(material);
            }

            console.log(`Sincronizados ${localOnlyMaterials.length} materiales a la nube`);
            return true;
        } catch (error) {
            console.error('Error al sincronizar:', error);
            return false;
        }
    }

    // Verificar estado de la conexión
    async checkConnection() {
        if (this.supabaseUrl === 'TU_SUPABASE_URL') return false;
        
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Obtener estado de la base de datos
    getStatus() {
        return {
            initialized: this.initialized,
            online: this.isOnline,
            tableName: this.tableName,
            hasCredentials: this.supabaseUrl !== 'TU_SUPABASE_URL'
        };
    }
}

// Exportar para uso en otros archivos
window.DatabaseManager = DatabaseManager;


