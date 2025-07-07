// Sistema de Gestión de Materiales Mineros - Versión Simplificada
class MaterialMineroSystem {
    constructor() {
        this.materials = [];
        this.currentEditId = null;
        this.db = new DatabaseManager();
        this.init();
    }

    async init() {
        await this.db.initialize();
        this.setupEventListeners();
        await this.loadMaterials();
        this.renderTable();
        this.updateSummary();
        this.showConnectionStatus();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulario
        document.getElementById('materialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Botón cancelar
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Búsqueda
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchMaterials();
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.searchMaterials();
            }
        });

        // Modal de eliminación
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeDeleteModal();
            }
        });
    }

    // Manejar envío del formulario
    async handleFormSubmit() {
        const formData = this.getFormData();
        if (this.validateForm(formData)) {
            this.showLoading(true);
            
            try {
                if (this.currentEditId !== null) {
                    await this.updateMaterial(formData);
                } else {
                    await this.addMaterial(formData);
                }
                this.resetForm();
                await this.loadMaterials();
                this.renderTable();
                this.updateSummary();
            } catch (error) {
                this.showMessage('Error al procesar la solicitud', 'error');
            } finally {
                this.showLoading(false);
            }
        }
    }

    // Obtener datos del formulario
    getFormData() {
        return {
            tipoMaterial: document.getElementById('tipoMaterial').value,
            peso: parseFloat(document.getElementById('peso').value),
            fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual automática
            ubicacion: document.getElementById('ubicacion').value,
            descripcion: document.getElementById('descripcion').value
        };
    }

    // Validar formulario
    validateForm(data) {
        if (!data.tipoMaterial || !data.peso || !data.ubicacion) {
            this.showMessage('Por favor complete todos los campos obligatorios', 'error');
            return false;
        }
        if (data.peso <= 0) {
            this.showMessage('El peso debe ser mayor a 0', 'error');
            return false;
        }
        return true;
    }

    // Agregar material
    async addMaterial(data) {
        const result = await this.db.addMaterial(data);
        if (result) {
            this.showMessage('Material agregado exitosamente', 'success');
        } else {
            this.showMessage('Error al agregar material', 'error');
        }
    }

    // Actualizar material
    async updateMaterial(data) {
        const result = await this.db.updateMaterial(this.currentEditId, data);
        if (result) {
            this.showMessage('Material actualizado exitosamente', 'success');
        } else {
            this.showMessage('Error al actualizar material', 'error');
        }
    }

    // Editar material
    editMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (material) {
            this.currentEditId = id;
            this.populateForm(material);
            this.showEditMode();
        }
    }

    // Poblar formulario con datos del material
    populateForm(material) {
        document.getElementById('tipoMaterial').value = material.tipoMaterial;
        document.getElementById('peso').value = material.peso;
        document.getElementById('ubicacion').value = material.ubicacion;
        document.getElementById('descripcion').value = material.descripcion;
    }

    // Mostrar modo edición
    showEditMode() {
        document.getElementById('submitBtn').textContent = 'Actualizar Material';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        document.querySelector('.form-section h2').textContent = 'Editar Material';
    }

    // Cancelar edición
    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
        this.hideEditMode();
    }

    // Ocultar modo edición
    hideEditMode() {
        document.getElementById('submitBtn').textContent = 'Agregar Material';
        document.getElementById('cancelBtn').style.display = 'none';
        document.querySelector('.form-section h2').textContent = 'Registro de Material';
    }

    // Resetear formulario
    resetForm() {
        document.getElementById('materialForm').reset();
        this.hideEditMode();
    }

    // Eliminar material
    deleteMaterial(id) {
        this.materialToDelete = id;
        this.showDeleteModal();
    }

    // Mostrar modal de confirmación
    showDeleteModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    // Cerrar modal de confirmación
    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.materialToDelete = null;
    }

    // Confirmar eliminación
    async confirmDelete() {
        if (this.materialToDelete) {
            this.showLoading(true);
            
            try {
                const result = await this.db.deleteMaterial(this.materialToDelete);
                if (result) {
                    await this.loadMaterials();
                    this.renderTable();
                    this.updateSummary();
                    this.showMessage('Material eliminado exitosamente', 'success');
                } else {
                    this.showMessage('Error al eliminar material', 'error');
                }
            } catch (error) {
                this.showMessage('Error al eliminar material', 'error');
            } finally {
                this.showLoading(false);
            }
        }
        this.closeDeleteModal();
    }

    // Renderizar tabla
    renderTable(materialsToShow = null) {
        const tbody = document.getElementById('materialsTableBody');
        const materials = materialsToShow || this.materials;
        
        tbody.innerHTML = '';
        
        if (materials.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No hay materiales registrados</td></tr>';
            return;
        }

        materials.forEach(material => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${material.id}</td>
                <td>${this.capitalizeFirst(material.tipoMaterial)}</td>
                <td>${material.peso.toFixed(2)}</td>
                <td>${this.formatDate(material.fechaIngreso)}</td>
                <td>${material.ubicacion}</td>
                <td>${material.descripcion || '-'}</td>
                <td class="actions">
                    <button class="edit-btn" onclick="materialSystem.editMaterial(${material.id})">
                        Editar
                    </button>
                    <button class="delete-btn" onclick="materialSystem.deleteMaterial(${material.id})">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Buscar materiales
    searchMaterials() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        if (!query) {
            this.renderTable();
            return;
        }

        const filtered = this.materials.filter(material => 
            material.tipoMaterial.toLowerCase().includes(query) ||
            material.ubicacion.toLowerCase().includes(query) ||
            material.descripcion.toLowerCase().includes(query)
        );

        this.renderTable(filtered);
        this.showMessage(`Se encontraron ${filtered.length} resultado(s)`, 'info');
    }

    // Limpiar búsqueda
    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.renderTable();
    }

    // Actualizar resumen
    updateSummary() {
        const totalRecords = this.materials.length;
        document.getElementById('totalRecords').textContent = totalRecords;
    }

    // Mostrar mensaje
    showMessage(text, type) {
        // Remover mensaje anterior si existe
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        const container = document.querySelector('.container');
        container.insertBefore(message, container.firstChild);
        
        // Remover mensaje después de 5 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    // Guardar en localStorage
    saveToStorage() {
        try {
            localStorage.setItem('materialMineroData', JSON.stringify(this.materials));
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    }

    // Cargar materiales desde base de datos
    async loadMaterials() {
        try {
            this.materials = await this.db.getMaterials();
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            this.materials = [];
        }
    }

    // Mostrar estado de conexión
    showConnectionStatus() {
        const status = this.db.getStatus();
        const statusText = status.online ? 'Online' : 'Offline';
        const statusColor = status.online ? '#27ae60' : '#e74c3c';
        
        // Crear indicador de estado
        const statusIndicator = document.createElement('div');
        statusIndicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${statusColor};
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                ${statusText} ${status.online ? '🟢' : '🔴'}
            </div>
        `;
        document.body.appendChild(statusIndicator);
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const submitBtn = document.getElementById('submitBtn');
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = this.currentEditId ? 'Actualizar Material' : 'Agregar Material';
        }
    }

    // Cargar desde localStorage (respaldo)
    loadFromStorage() {
        try {
            const savedMaterials = localStorage.getItem('materialMineroData');
            if (savedMaterials) {
                this.materials = JSON.parse(savedMaterials);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.materials = [];
        }
    }

    // Utilidades
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

// Inicializar sistema cuando se carga la página
let materialSystem;

document.addEventListener('DOMContentLoaded', async () => {
    materialSystem = new MaterialMineroSystem();
});

// Manejo de errores
window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
    if (materialSystem) {
        materialSystem.showMessage('Ha ocurrido un error', 'error');
    }
});
