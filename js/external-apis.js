// Manejo de APIs Externas
class ExternalAPIs {
    constructor() {
        this.pokemonAPI = 'https://pokeapi.co/api/v2';
        this.countriesAPI = 'https://restcountries.com/v3.1';
        this.materials = [];
        this.locations = [];
    }

    // Cargar materiales desde Pokémon API
    async loadMaterials() {
        try {
            console.log('🔄 Cargando materiales desde Pokémon API...');
            
            // Obtener primeros 20 pokémon para usar como "materiales"
            const response = await fetch(`${this.pokemonAPI}/pokemon?limit=20`);
            const data = await response.json();
            
            this.materials = data.results.map(pokemon => ({
                name: this.capitalizeFirst(pokemon.name),
                value: pokemon.name
            }));
            
            console.log('✅ Materiales cargados:', this.materials.length);
            return this.materials;
        } catch (error) {
            console.error('❌ Error cargando materiales:', error);
            // Respaldo en caso de error
            return [
                { name: 'Oro', value: 'oro' },
                { name: 'Plata', value: 'plata' },
                { name: 'Cobre', value: 'cobre' }
            ];
        }
    }

    // Cargar ubicaciones desde REST Countries API
    async loadLocations() {
        try {
            console.log('🔄 Cargando ubicaciones desde REST Countries API...');
            
            // Obtener países de América (más relevante para minería)
            const response = await fetch(`${this.countriesAPI}/region/americas?fields=name,capital`);
            const countries = await response.json();
            
            // Crear lista de ubicaciones con países y capitales
            this.locations = [];
            
            countries.slice(0, 15).forEach(country => {
                const countryName = country.name.common;
                
                // Agregar el país
                this.locations.push({
                    name: `${countryName}`,
                    value: countryName.toLowerCase()
                });
                
                // Agregar la capital si existe
                if (country.capital && country.capital[0]) {
                    this.locations.push({
                        name: `${country.capital[0]}, ${countryName}`,
                        value: `${country.capital[0].toLowerCase()}-${countryName.toLowerCase()}`
                    });
                }
            });
            
            console.log('✅ Ubicaciones cargadas:', this.locations.length);
            return this.locations;
        } catch (error) {
            console.error('❌ Error cargando ubicaciones:', error);
            // Respaldo en caso de error
            return [
                { name: 'Mina Norte - Sector A', value: 'mina-norte-a' },
                { name: 'Mina Sur - Sector B', value: 'mina-sur-b' },
                { name: 'Almacén Central', value: 'almacen-central' }
            ];
        }
    }

    // Poblar select de materiales
    populateMaterialsSelect(materials) {
        const select = document.getElementById('tipoMaterial');
        select.innerHTML = '<option value="">Seleccione un material...</option>';
        
        materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material.value;
            option.textContent = material.name;
            select.appendChild(option);
        });
    }

    // Poblar select de ubicaciones
    populateLocationsSelect(locations) {
        const select = document.getElementById('ubicacion');
        select.innerHTML = '<option value="">Seleccione una ubicación...</option>';
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.value;
            option.textContent = location.name;
            select.appendChild(option);
        });
    }

    // Inicializar APIs
    async initialize() {
        try {
            // Cargar materiales y ubicaciones en paralelo
            const [materials, locations] = await Promise.all([
                this.loadMaterials(),
                this.loadLocations()
            ]);
            
            // Poblar los selects
            this.populateMaterialsSelect(materials);
            this.populateLocationsSelect(locations);
            
            console.log('🎉 APIs externas inicializadas correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando APIs:', error);
            return false;
        }
    }

    // Utilidad para capitalizar primera letra
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Obtener nombre legible de un valor
    getMaterialName(value) {
        const material = this.materials.find(m => m.value === value);
        return material ? material.name : value;
    }

    getLocationName(value) {
        const location = this.locations.find(l => l.value === value);
        return location ? location.name : value;
    }
}

// Exportar para uso global
window.ExternalAPIs = ExternalAPIs;
