// Settings module
const Settings = {
    currentSettings: {},
    isDirty: false,

    init() {
        this.bindEvents();
        this.loadSettings();
    },

    bindEvents() {
        const saveBtn = document.getElementById('save-settings');
        const analysisFreq = document.getElementById('analysis-frequency');
        const anomalyThreshold = document.getElementById('anomaly-threshold');
        const thresholdValue = document.getElementById('threshold-value');
        const granite33Enabled = document.getElementById('granite33-enabled');
        const granite40Enabled = document.getElementById('granite40-enabled');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Analysis frequency change
        if (analysisFreq) {
            analysisFreq.addEventListener('change', () => {
                this.isDirty = true;
                this.updateSaveButton();
            });
        }

        // Anomaly threshold slider
        if (anomalyThreshold && thresholdValue) {
            anomalyThreshold.addEventListener('input', (e) => {
                thresholdValue.textContent = e.target.value;
                this.isDirty = true;
                this.updateSaveButton();
            });
        }

        // Model toggles
        [granite33Enabled, granite40Enabled].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.isDirty = true;
                    this.updateSaveButton();
                });
            }
        });
    },

    async loadSettings() {
        try {
            const result = await api.getSettings();
            
            if (result && result.success) {
                this.currentSettings = result.data;
                this.populateForm(result.data);
            } else {
                // Use default settings if none exist
                this.useDefaultSettings();
            }
        } catch (error) {
            handleApiError(error, 'loading settings');
            this.useDefaultSettings();
        }
    },

    populateForm(settings) {
        const elements = {
            'analysis-frequency': settings.analysis_frequency || 'real-time',
            'anomaly-threshold': settings.anomaly_threshold || 5,
            'granite33-enabled': settings.granite33_enabled !== false,
            'granite40-enabled': settings.granite40_enabled !== false
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    // Update the display value
                    const display = document.getElementById('threshold-value');
                    if (display) display.textContent = value;
                } else {
                    element.value = value;
                }
            }
        });

        this.isDirty = false;
        this.updateSaveButton();
    },

    useDefaultSettings() {
        const defaults = {
            analysis_frequency: 'real-time',
            anomaly_threshold: 5,
            granite33_enabled: true,
            granite40_enabled: true
        };
        
        this.currentSettings = defaults;
        this.populateForm(defaults);
    },

    async saveSettings() {
        const settings = this.collectFormData();
        
        try {
            Utils.showLoading();
            const result = await api.updateSettings(settings);
            
            if (result && result.success) {
                this.currentSettings = settings;
                this.isDirty = false;
                this.updateSaveButton();
                Utils.showNotification('Settings saved successfully', 'success');
            } else {
                throw new Error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            handleApiError(error, 'saving settings');
        } finally {
            Utils.hideLoading();
        }
    },

    collectFormData() {
        return {
            analysis_frequency: document.getElementById('analysis-frequency')?.value || 'real-time',
            anomaly_threshold: parseInt(document.getElementById('anomaly-threshold')?.value) || 5,
            granite33_enabled: document.getElementById('granite33-enabled')?.checked || false,
            granite40_enabled: document.getElementById('granite40-enabled')?.checked || false
        };
    },

    updateSaveButton() {
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            if (this.isDirty) {
                saveBtn.classList.add('btn-warning');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            } else {
                saveBtn.classList.remove('btn-warning');
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
            }
        }
    },

    // Export settings as JSON
    exportSettings() {
        const dataStr = JSON.stringify(this.currentSettings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-netsage-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
        Utils.showNotification('Settings exported successfully', 'success');
    },

    // Import settings from JSON file
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.currentSettings = settings;
                this.populateForm(settings);
                this.isDirty = true;
                this.updateSaveButton();
                Utils.showNotification('Settings imported successfully', 'success');
            } catch (error) {
                Utils.showNotification('Failed to import settings: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }
};