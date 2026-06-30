// ==========================================================================
// ZAPFLOW - APPLICATION LOGIC (UPDATED WITH TEXT LIST IMPORT)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Print authorship watermark in console (hidden proof)
    console.log(
        "%c🛡️ ZapFlow Pro | Autoria Confirmada | Criador & Desenvolvedor: Natan Marinho | Registro: NM-PRO-ZAPFLOW-2026 🛡️", 
        "color: #a78bfa; font-size: 12px; font-weight: bold; background: #0b0f19; padding: 8px 12px; border: 1px solid #7c3aed; border-radius: 6px; text-shadow: 0 0 5px rgba(124, 58, 237, 0.5);"
    );

    // --- Application State ---
    let state = {
        contacts: [],
        templates: {
            whatsapp: '',
            emailSubject: '',
            emailBody: ''
        },
        currentFilter: 'all',
        searchQuery: '',
        selectedContactId: null,
        activeTab: 'whatsapp', // 'whatsapp' or 'email'
        
        // Automation Queue
        automationQueue: [],
        automationIndex: 0,
        automationChannel: 'wa' // 'wa', 'gmail', or 'mail'
    };

    // --- Default Templates ---
    const DEFAULT_TEMPLATES = {
        whatsapp: 'Olá {{nome}}! Tudo bem?\n\nConfirmamos o seu e-mail cadastrado como {{email}}.\nCódigo de referência: {{variavel}}.\n\nQualquer dúvida, estamos à disposição!',
        emailSubject: 'Olá {{nome}}, temos uma novidade para você!',
        emailBody: 'Prezado(a) {{nome}},\n\nEscrevemos para informar o recebimento dos seus dados. O e-mail registrado em nossa base é {{email}}.\n\nInformações adicionais:\n{{variavel}}\n\nAtenciosamente,\nEquipe ZapFlow'
    };

    // --- DOM Elements ---
    // Metrics
    const elMetricTotal = document.getElementById('metric-total');
    const elMetricPending = document.getElementById('metric-pending');
    const elMetricSent = document.getElementById('metric-sent');
    const elMetricRate = document.getElementById('metric-rate');

    // Import & Add
    const elImportTabNavs = document.querySelectorAll('.import-tabs-nav .tab-btn');
    const elImportTabContents = document.querySelectorAll('.import-tab-content');
    
    // File Import
    const elCsvDropzone = document.getElementById('csv-dropzone');
    const elCsvFileInput = document.getElementById('csv-file-input');
    
    // Text Import
    const elImportTextArea = document.getElementById('import-text-area');
    const elBtnImportText = document.getElementById('btn-import-text');
    
    // Other Import Actions
    const elBtnDownloadTemplate = document.getElementById('btn-download-template');
    const elBtnToggleManual = document.getElementById('btn-toggle-manual');
    const elManualForm = document.getElementById('manual-contact-form');
    const elBtnCancelManual = document.getElementById('btn-cancel-manual');
    
    // Manual Inputs
    const elInputName = document.getElementById('input-name');
    const elInputPhone = document.getElementById('input-phone');
    const elInputEmail = document.getElementById('input-email');
    const elInputVar = document.getElementById('input-var');

    // Templates
    const elTabBtns = document.querySelectorAll('.tabs-container:not(.import-tabs-nav) .tab-btn');
    const elTabContents = document.querySelectorAll('.tab-content');
    const elTemplateWa = document.getElementById('template-whatsapp');
    const elTemplateEmailSubject = document.getElementById('template-email-subject');
    const elTemplateEmailBody = document.getElementById('template-email-body');
    const elVarBadges = document.querySelectorAll('.var-badge');
    
    // Live Preview
    const elPreviewTargetName = document.getElementById('preview-target-name');
    const elPreviewTextContent = document.getElementById('preview-text-content');
    const elPreviewBox = document.getElementById('preview-box');

    // Table & Filters
    const elSearchContacts = document.getElementById('search-contacts');
    const elFilterBtns = document.querySelectorAll('.filter-btn');
    const elContactsTableBody = document.getElementById('contacts-table-body');
    const elBtnClearAll = document.getElementById('btn-clear-all');
    const elBtnExportCsv = document.getElementById('btn-export-csv');
    const elBtnSaveBackup = document.getElementById('btn-save-backup');
    const elBtnLoadBackup = document.getElementById('btn-load-backup');
    const elBackupFileInput = document.getElementById('backup-file-input');

    // Automation Modal
    const elBtnStartAutomation = document.getElementById('btn-start-automation');
    const elAutomationModal = document.getElementById('automation-modal');
    const elBtnCloseModal = document.getElementById('btn-close-modal');
    
    // Modal Details
    const elModalProgressLabel = document.getElementById('modal-progress-label');
    const elModalProgressCount = document.getElementById('modal-progress-count');
    const elModalProgressFill = document.getElementById('modal-progress-fill');
    
    const elModalContactInitials = document.getElementById('modal-contact-initials');
    const elModalContactName = document.getElementById('modal-contact-name');
    const elModalContactPhone = document.getElementById('modal-contact-phone');
    const elModalContactEmail = document.getElementById('modal-contact-email');
    const elModalContactStatus = document.getElementById('modal-contact-status');
    
    const elModalBtnWa = document.getElementById('modal-btn-wa');
    const elModalBtnGmail = document.getElementById('modal-btn-gmail');
    const elModalBtnMail = document.getElementById('modal-btn-mail');
    const elModalMessageHeader = document.getElementById('modal-message-header');
    const elModalMessageBody = document.getElementById('modal-message-body');
    const elModalChannelTip = document.getElementById('modal-channel-tip');
    
    // Modal Actions
    const elModalBtnSkip = document.getElementById('modal-btn-skip');
    const elModalBtnManualSent = document.getElementById('modal-btn-manual-sent');
    const elModalBtnSend = document.getElementById('modal-btn-send');

    // Watermark / Easter Egg Elements
    const elLogoTrigger = document.getElementById('logo-trigger');
    const elWatermarkModal = document.getElementById('watermark-modal');
    const elBtnCloseWatermark = document.getElementById('btn-close-watermark');

    // Toast
    const elToastContainer = document.getElementById('toast-container');

    // --- Focus tracker for inserting variables ---
    let lastActiveTextarea = elTemplateWa;

    // --- Easter Egg Click Counter ---
    let logoClicks = 0;
    let logoClickTimeout = null;

    // ==========================================================================
    // INITIALIZATION & STATE MANAGEMENT
    // ==========================================================================

    function init() {
        // Load templates
        const savedTemplates = localStorage.getItem('zapflow_templates');
        if (savedTemplates) {
            state.templates = JSON.parse(savedTemplates);
        } else {
            state.templates = { ...DEFAULT_TEMPLATES };
        }

        // Set templates to inputs
        elTemplateWa.value = state.templates.whatsapp;
        elTemplateEmailSubject.value = state.templates.emailSubject;
        elTemplateEmailBody.value = state.templates.emailBody;

        // Load contacts
        const savedContacts = localStorage.getItem('zapflow_contacts');
        if (savedContacts) {
            state.contacts = JSON.parse(savedContacts);
            if (state.contacts.length > 0) {
                state.selectedContactId = state.contacts[0].id;
            }
        }

        registerEventListeners();
        updateMetrics();
        renderTable();
        updateLivePreview();
        lucide.createIcons();
    }

    function saveState() {
        localStorage.setItem('zapflow_contacts', JSON.stringify(state.contacts));
        localStorage.setItem('zapflow_templates', JSON.stringify(state.templates));
    }

    // ==========================================================================
    // TOAST NOTIFICATIONS
    // ==========================================================================

    function showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-circle';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-content">
                <h5>${title}</h5>
                <p>${message}</p>
            </div>
        `;
        
        elToastContainer.appendChild(toast);
        lucide.createIcons({ attrs: { class: 'toast-icon-svg' } });

        // Auto remove
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4000);
    }

    // ==========================================================================
    // UTILITIES & PARSERS
    // ==========================================================================

    // Clean and format Brazilian phone numbers
    function formatPhoneNumber(phone) {
        let clean = phone.replace(/\D/g, '');
        
        if (!clean) return '';

        if (clean.startsWith('0') && clean.length > 1) {
            clean = clean.substring(1);
        }

        if (clean.length === 10 || clean.length === 11) {
            clean = '55' + clean;
        }
        
        return clean;
    }

    // Import from CSV/TXT file
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
            showToast('Erro de Importação', 'O arquivo está vazio.', 'error');
            return;
        }

        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
        
        let nameIdx = -1;
        let phoneIdx = -1;
        let emailIdx = -1;
        let varIdx = -1;

        headers.forEach((header, idx) => {
            if (header.includes('nome') || header.includes('name') || header.includes('contato')) {
                nameIdx = idx;
            } else if (header.includes('telefone') || header.includes('phone') || header.includes('celular') || header.includes('whatsapp') || header.includes('tel')) {
                phoneIdx = idx;
            } else if (header.includes('email') || header.includes('mail')) {
                emailIdx = idx;
            } else if (header.includes('variavel') || header.includes('variable') || header.includes('extra') || header.includes('valor') || header.includes('vencimento') || header.includes('info')) {
                varIdx = idx;
            }
        });

        const hasHeaders = nameIdx !== -1 || phoneIdx !== -1;
        
        let startIdx = 0;
        if (hasHeaders) {
            startIdx = 1;
        } else {
            nameIdx = 0;
            phoneIdx = 1;
            emailIdx = 2;
            varIdx = 3;
        }

        let importedCount = 0;
        let duplicateCount = 0;

        for (let i = startIdx; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = [];
            let current = '';
            let inQuotes = false;
            for (let c = 0; c < line.length; c++) {
                const char = line[c];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === separator && !inQuotes) {
                    columns.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            columns.push(current.trim());

            const rawName = columns[nameIdx] || '';
            const rawPhone = columns[phoneIdx] || '';
            const rawEmail = columns[emailIdx] || '';
            const rawVar = columns[varIdx] || '';

            const cleanPhone = formatPhoneNumber(rawPhone);

            if (!rawName || !cleanPhone) {
                continue;
            }

            const isDuplicate = state.contacts.some(c => c.telefone === cleanPhone);
            if (isDuplicate) {
                duplicateCount++;
                continue;
            }

            state.contacts.push({
                id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                nome: rawName,
                telefone: cleanPhone,
                email: rawEmail,
                variavel: rawVar,
                status: 'pending'
            });
            importedCount++;
        }

        if (importedCount > 0) {
            state.selectedContactId = state.contacts[0].id;
            saveState();
            updateMetrics();
            renderTable();
            updateLivePreview();
            showToast('Importação Concluída', `${importedCount} contatos importados com sucesso.${duplicateCount > 0 ? ` (${duplicateCount} duplicados ignorados)` : ''}`, 'success');
        } else {
            showToast('Nenhum contato importado', 'Verifique se as colunas e os números de telefone estão corretos.', 'warning');
        }
    }

    // Import from pasted text list
    function parseTextList(text) {
        const lines = text.split('\n');
        let importedCount = 0;
        let duplicateCount = 0;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Try splitting by common separators: comma, semicolon, tab, pipe, hyphen, colon
            let parts = [];
            const separators = [',', ';', '\t', '|', ' - ', ':'];
            
            let separatorUsed = null;
            for (let sep of separators) {
                if (line.includes(sep)) {
                    separatorUsed = sep;
                    break;
                }
            }

            if (separatorUsed) {
                // Split by the separator
                parts = line.split(separatorUsed).map(p => p.trim());
            } else {
                // Try splitting by last space if no separator is found
                const lastSpaceIndex = line.lastIndexOf(' ');
                if (lastSpaceIndex !== -1) {
                    const lastPart = line.substring(lastSpaceIndex + 1).trim().replace(/\D/g, '');
                    if (lastPart.length >= 8) { // looks like a phone number
                        parts = [
                            line.substring(0, lastSpaceIndex).trim(),
                            line.substring(lastSpaceIndex + 1).trim()
                        ];
                    }
                }
            }

            if (parts.length >= 2) {
                const name = parts[0];
                let phoneCandidate = parts[1];
                let emailCandidate = '';
                let varCandidate = '';

                // If we have more than 2 columns, try to classify them
                for (let idx = 2; idx < parts.length; idx++) {
                    const val = parts[idx];
                    if (val.includes('@')) {
                        emailCandidate = val;
                    } else {
                        varCandidate = val;
                    }
                }

                const cleanPhone = formatPhoneNumber(phoneCandidate);

                if (name && cleanPhone) {
                    const isDuplicate = state.contacts.some(c => c.telefone === cleanPhone);
                    if (isDuplicate) {
                        duplicateCount++;
                        return;
                    }

                    state.contacts.push({
                        id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        nome: name,
                        telefone: cleanPhone,
                        email: emailCandidate,
                        variavel: varCandidate,
                        status: 'pending'
                    });
                    importedCount++;
                }
            }
        });

        if (importedCount > 0) {
            state.selectedContactId = state.contacts[0].id;
            saveState();
            updateMetrics();
            renderTable();
            updateLivePreview();
            showToast('Lista Importada', `${importedCount} contatos carregados.${duplicateCount > 0 ? ` (${duplicateCount} duplicados ignorados)` : ''}`, 'success');
            elImportTextArea.value = ''; // clear text area
        } else {
            showToast('Erro de Importação', 'Não conseguimos ler os dados. Use formatos como: Nome, Telefone', 'error');
        }
    }

    function replaceVariables(template, contact) {
        if (!template) return '';
        if (!contact) return template;

        return template
            .replace(/\{\{\s*nome\s*\}\}/gi, contact.nome)
            .replace(/\{\{\s*telefone\s*\}\}/gi, contact.telefone)
            .replace(/\{\{\s*email\s*\}\}/gi, contact.email || 'N/A')
            .replace(/\{\{\s*variavel\s*\}\}/gi, contact.variavel || 'N/A');
    }

    // ==========================================================================
    // UI RENDERING
    // ==========================================================================

    function updateMetrics() {
        const total = state.contacts.length;
        const sent = state.contacts.filter(c => c.status === 'sent').length;
        const pending = total - sent;
        const rate = total > 0 ? Math.round((sent / total) * 100) : 0;

        elMetricTotal.textContent = total;
        elMetricPending.textContent = pending;
        elMetricSent.textContent = sent;
        elMetricRate.textContent = `${rate}%`;
    }

    function renderTable() {
        elContactsTableBody.innerHTML = '';

        let filtered = state.contacts.filter(contact => {
            const query = state.searchQuery.toLowerCase();
            const matchesSearch = 
                contact.nome.toLowerCase().includes(query) ||
                contact.telefone.includes(query) ||
                (contact.email && contact.email.toLowerCase().includes(query)) ||
                (contact.variavel && contact.variavel.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            if (state.currentFilter === 'pending') return contact.status === 'pending';
            if (state.currentFilter === 'sent') return contact.status === 'sent';
            
            return true;
        });

        if (filtered.length === 0) {
            elContactsTableBody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="6">
                        <div class="empty-state">
                            <i data-lucide="search" class="empty-icon"></i>
                            <p>Nenhum contato encontrado.</p>
                            <span>Tente ajustar seus filtros ou busca.</span>
                        </div>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        filtered.forEach(contact => {
            const tr = document.createElement('tr');
            tr.className = state.selectedContactId === contact.id ? 'selected-row' : '';
            tr.style.cursor = 'pointer';
            
            tr.addEventListener('click', (e) => {
                if (e.target.closest('.actions-cell') || e.target.closest('button')) return;
                state.selectedContactId = contact.id;
                
                document.querySelectorAll('#contacts-table-body tr').forEach(r => r.classList.remove('selected-row'));
                tr.classList.add('selected-row');
                
                updateLivePreview();
            });

            const badgeClass = contact.status === 'sent' ? 'badge-sent' : 'badge-pending';
            const badgeText = contact.status === 'sent' ? 'Enviado' : 'Pendente';

            tr.innerHTML = `
                <td><strong>${contact.nome}</strong></td>
                <td>${contact.telefone}</td>
                <td><span class="text-secondary">${contact.email || '-'}</span></td>
                <td><span class="text-secondary">${contact.variavel || '-'}</span></td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td class="text-right">
                    <div class="actions-cell">
                        <button class="action-btn btn-wa" title="Enviar via WhatsApp" data-id="${contact.id}">
                            <i data-lucide="phone"></i>
                        </button>
                        <button class="action-btn btn-gmail" title="Enviar via Gmail Web" data-id="${contact.id}">
                            <i data-lucide="mail"></i>
                        </button>
                        <button class="action-btn btn-mail" title="Enviar via E-mail Padrão" data-id="${contact.id}">
                            <i data-lucide="mail-open"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Excluir" data-id="${contact.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;

            elContactsTableBody.appendChild(tr);
        });

        // Add action button listeners
        elContactsTableBody.querySelectorAll('.btn-wa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const contact = state.contacts.find(c => c.id === id);
                if (contact) triggerSingleSend(contact, 'wa');
            });
        });

        elContactsTableBody.querySelectorAll('.btn-gmail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const contact = state.contacts.find(c => c.id === id);
                if (contact) triggerSingleSend(contact, 'gmail');
            });
        });

        elContactsTableBody.querySelectorAll('.btn-mail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const contact = state.contacts.find(c => c.id === id);
                if (contact) triggerSingleSend(contact, 'mail');
            });
        });

        elContactsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                deleteContact(id);
            });
        });

        lucide.createIcons();
    }

    function updateLivePreview() {
        const contact = state.contacts.find(c => c.id === state.selectedContactId) || state.contacts[0];
        
        if (!contact) {
            elPreviewTargetName.textContent = 'Nenhum contato cadastrado';
            elPreviewTextContent.innerHTML = '<span class="text-muted">Importe contatos ou cadastre manualmente para ver a pré-visualização.</span>';
            return;
        }

        elPreviewTargetName.innerHTML = `<i data-lucide="user" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i> Destinatário: <strong>${contact.nome}</strong>`;

        if (state.activeTab === 'whatsapp') {
            const text = replaceVariables(state.templates.whatsapp, contact);
            elPreviewTextContent.innerHTML = text ? text.replace(/\n/g, '<br>') : '<span class="text-muted">[Mensagem Vazia]</span>';
            elPreviewBox.style.borderColor = 'rgba(37, 211, 102, 0.2)';
        } else {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            
            elPreviewTextContent.innerHTML = `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 8px;">
                    <span class="text-secondary">Assunto:</span> <strong>${subject || '[Sem Assunto]'}</strong>
                </div>
                <div>
                    ${body ? body.replace(/\n/g, '<br>') : '<span class="text-muted">[Corpo Vazio]</span>'}
                </div>
            `;
            elPreviewBox.style.borderColor = 'rgba(37, 99, 235, 0.2)';
        }
        
        lucide.createIcons();
    }

    // ==========================================================================
    // CONTACT ACTIONS
    // ==========================================================================

    function deleteContact(id) {
        state.contacts = state.contacts.filter(c => c.id !== id);
        if (state.selectedContactId === id) {
            state.selectedContactId = state.contacts.length > 0 ? state.contacts[0].id : null;
        }
        saveState();
        updateMetrics();
        renderTable();
        updateLivePreview();
        showToast('Contato Removido', 'O contato foi excluído da lista.', 'info');
    }

    function clearAllContacts() {
        if (state.contacts.length === 0) return;
        
        if (confirm('Tem certeza que deseja remover todos os contatos? Esta ação não pode ser desfeita.')) {
            state.contacts = [];
            state.selectedContactId = null;
            saveState();
            updateMetrics();
            renderTable();
            updateLivePreview();
            showToast('Lista Limpa', 'Todos os contatos foram removidos.', 'warning');
        }
    }

    function triggerSingleSend(contact, channel) {
        if (channel === 'wa') {
            const message = replaceVariables(state.templates.whatsapp, contact);
            const encodedText = encodeURIComponent(message);
            const url = `https://wa.me/${contact.telefone}?text=${encodedText}`;
            
            window.open(url, '_blank');
            markAsSent(contact.id);
            showToast('Link WhatsApp Aberto', `Enviando para ${contact.nome}`, 'success');
        } else if (channel === 'gmail') {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const targetEmail = encodeURIComponent(contact.email || '');
            const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodedSubject}&body=${encodedBody}`;
            
            window.open(url, '_blank');
            markAsSent(contact.id);
            showToast('Gmail Web Aberto', `Escrevendo e-mail para ${contact.nome}`, 'success');
        } else {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const url = `mailto:${contact.email || ''}?subject=${encodedSubject}&body=${encodedBody}`;
            
            window.open(url, '_self');
            markAsSent(contact.id);
            showToast('E-mail Iniciado', `Abrindo cliente de e-mail para ${contact.nome}`, 'success');
        }
    }

    function markAsSent(id) {
        const contact = state.contacts.find(c => c.id === id);
        if (contact) {
            contact.status = 'sent';
            saveState();
            updateMetrics();
            renderTable();
            updateLivePreview();
        }
    }

    function exportCSV() {
        if (state.contacts.length === 0) {
            showToast('Exportação Vazia', 'Não há contatos para exportar.', 'warning');
            return;
        }

        let csvContent = 'data:text/csv;charset=utf-8,Nome;Telefone;Email;VariavelExtra;Status\n';
        
        state.contacts.forEach(c => {
            const row = [
                `"${c.nome.replace(/"/g, '""')}"`,
                `"${c.telefone}"`,
                `"${(c.email || '').replace(/"/g, '""')}"`,
                `"${(c.variavel || '').replace(/"/g, '""')}"`,
                `"${c.status}"`
            ].join(';');
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `zapflow_contatos_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exportação Concluída', 'O arquivo CSV foi baixado com sucesso.', 'success');
    }

    function downloadTemplateCSV() {
        const csvContent = 'data:text/csv;charset=utf-8,Nome;Telefone;Email;VariavelExtra\n' +
                           'Joao Silva;5511999998888;joao@email.com;R$ 150.00\n' +
                           'Maria Souza;5521988887777;maria@email.com;Vencimento 15/10\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'modelo_zapflow.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function saveBackupToFile() {
        if (state.contacts.length === 0) {
            showToast('Backup Vazio', 'Não há contatos para salvar no backup.', 'warning');
            return;
        }

        const backupData = {
            contacts: state.contacts,
            templates: state.templates
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zapflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('Backup Salvo', 'O arquivo de backup (.json) foi baixado com sucesso.', 'success');
    }

    function handleBackupFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (data && Array.isArray(data.contacts) && data.templates) {
                    if (confirm(`Deseja restaurar o backup? Isso substituirá seus contatos e modelos atuais por ${data.contacts.length} contatos do backup.`)) {
                        state.contacts = data.contacts;
                        state.templates = data.templates;

                        if (state.contacts.length > 0) {
                            state.selectedContactId = state.contacts[0].id;
                        } else {
                            state.selectedContactId = null;
                        }

                        // Update template inputs
                        elTemplateWa.value = state.templates.whatsapp || '';
                        elTemplateEmailSubject.value = state.templates.emailSubject || '';
                        elTemplateEmailBody.value = state.templates.emailBody || '';

                        saveState();
                        updateMetrics();
                        renderTable();
                        updateLivePreview();

                        showToast('Backup Restaurado', 'Contatos e templates restaurados com sucesso!', 'success');
                    }
                } else {
                    showToast('Erro de Restauração', 'O arquivo de backup selecionado é inválido ou está corrompido.', 'error');
                }
            } catch (err) {
                showToast('Erro de Restauração', 'Não foi possível ler o arquivo. Certifique-se de que é um arquivo JSON de backup válido.', 'error');
            }
            elBackupFileInput.value = ''; // Reset file input
        };
        reader.readAsText(file, 'UTF-8');
    }

    // ==========================================================================
    // SEQUENTIAL AUTOMATION ENGINE (MODAL FLOW)
    // ==========================================================================

    function startSequentialAutomation() {
        const pendingContacts = state.contacts.filter(c => c.status === 'pending');
        
        if (pendingContacts.length === 0) {
            showToast('Nenhum contato pendente', 'Todos os contatos da lista já foram enviados ou a lista está vazia.', 'info');
            return;
        }

        state.automationQueue = pendingContacts;
        state.automationIndex = 0;
        
        if (state.activeTab === 'whatsapp') {
            state.automationChannel = 'wa';
        } else {
            state.automationChannel = 'gmail';
        }

        elAutomationModal.classList.remove('hidden');
        updateModalChannelTab();
        loadAutomationContact();
    }

    function updateModalChannelTab() {
        elModalBtnWa.classList.remove('active');
        elModalBtnGmail.classList.remove('active');
        elModalBtnMail.classList.remove('active');

        if (state.automationChannel === 'wa') {
            elModalBtnWa.classList.add('active');
        } else if (state.automationChannel === 'gmail') {
            elModalBtnGmail.classList.add('active');
        } else {
            elModalBtnMail.classList.add('active');
        }
    }

    function loadAutomationContact() {
        if (state.automationIndex >= state.automationQueue.length) {
            completeAutomation();
            return;
        }

        const contact = state.automationQueue[state.automationIndex];
        const total = state.automationQueue.length;
        const currentNum = state.automationIndex + 1;
        const percent = Math.round((state.automationIndex / total) * 100);

        // Update Progress
        elModalProgressLabel.textContent = `Processando fila de disparo...`;
        elModalProgressCount.textContent = `${currentNum} / ${total}`;
        elModalProgressFill.style.width = `${percent}%`;

        // Update Contact Card
        elModalContactName.textContent = contact.nome;
        elModalContactPhone.textContent = contact.telefone;
        elModalContactEmail.textContent = contact.email || 'Não informado';
        
        const initials = contact.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        elModalContactInitials.textContent = initials || '??';

        // Message Body preview based on active modal channel
        if (state.automationChannel === 'wa') {
            const message = replaceVariables(state.templates.whatsapp, contact);
            elModalMessageHeader.innerHTML = `<span><i data-lucide="phone" style="width:12px;height:12px;display:inline;margin-right:4px;"></i> Envio via WhatsApp</span>`;
            elModalMessageBody.innerHTML = message ? message.replace(/\n/g, '<br>') : '<span class="text-muted">[Mensagem Vazia]</span>';
            elModalBtnSend.innerHTML = `<i data-lucide="external-link"></i> Abrir WhatsApp`;
            elModalBtnSend.style.background = 'var(--color-green)';
            elModalChannelTip.textContent = 'Ao clicar em "Abrir WhatsApp", o WhatsApp Web ou Desktop será aberto com a mensagem preenchida.';
        } else if (state.automationChannel === 'gmail') {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            elModalMessageHeader.innerHTML = `<span>Assunto: <strong>${subject || '[Sem Assunto]'}</strong></span>`;
            elModalMessageBody.innerHTML = body ? body.replace(/\n/g, '<br>') : '<span class="text-muted">[Corpo Vazio]</span>';
            elModalBtnSend.innerHTML = `<i data-lucide="external-link"></i> Abrir Gmail Web`;
            elModalBtnSend.style.background = 'var(--color-gmail)';
            elModalChannelTip.textContent = 'Ao clicar em "Abrir Gmail Web", uma nova guia será aberta no editor do Gmail com o destinatário, assunto e corpo preenchidos.';
        } else {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            elModalMessageHeader.innerHTML = `<span>Assunto: <strong>${subject || '[Sem Assunto]'}</strong></span>`;
            elModalMessageBody.innerHTML = body ? body.replace(/\n/g, '<br>') : '<span class="text-muted">[Corpo Vazio]</span>';
            elModalBtnSend.innerHTML = `<i data-lucide="external-link"></i> Abrir E-mail Padrão`;
            elModalBtnSend.style.background = 'var(--color-blue)';
            elModalChannelTip.textContent = 'Ao clicar em "Abrir E-mail Padrão", o seu aplicativo de e-mail local (Outlook, Mail, etc.) será acionado com o conteúdo pronto.';
        }

        lucide.createIcons();
    }

    function sendCurrentAutomation() {
        const contact = state.automationQueue[state.automationIndex];
        
        if (state.automationChannel === 'wa') {
            const message = replaceVariables(state.templates.whatsapp, contact);
            const encodedText = encodeURIComponent(message);
            const url = `https://wa.me/${contact.telefone}?text=${encodedText}`;
            window.open(url, '_blank');
        } else if (state.automationChannel === 'gmail') {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const targetEmail = encodeURIComponent(contact.email || '');
            const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodedSubject}&body=${encodedBody}`;
            window.open(url, '_blank');
        } else {
            const subject = replaceVariables(state.templates.emailSubject, contact);
            const body = replaceVariables(state.templates.emailBody, contact);
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const url = `mailto:${contact.email || ''}?subject=${encodedSubject}&body=${encodedBody}`;
            window.open(url, '_self');
        }

        markAsSent(contact.id);
        
        state.automationIndex++;
        setTimeout(() => {
            loadAutomationContact();
        }, 300);
    }

    function skipCurrentAutomation() {
        state.automationIndex++;
        loadAutomationContact();
        showToast('Contato Pulado', 'Avançou para o próximo contato sem enviar.', 'info');
    }

    function markCurrentAsSentManually() {
        const contact = state.automationQueue[state.automationIndex];
        markAsSent(contact.id);
        state.automationIndex++;
        loadAutomationContact();
        showToast('Marcado como Enviado', 'O status foi atualizado manualmente.', 'success');
    }

    function completeAutomation() {
        elModalProgressFill.style.width = '100%';
        elModalProgressLabel.textContent = 'Disparos finalizados!';
        
        showToast('Fila Concluída', 'Todos os contatos selecionados foram processados.', 'success');
        
        setTimeout(() => {
            elAutomationModal.classList.add('hidden');
        }, 1000);
    }

    // ==========================================================================
    // EVENT LISTENERS
    // ==========================================================================

    function registerEventListeners() {
        // Logo Easter Egg Trigger (5 clicks)
        elLogoTrigger.addEventListener('click', () => {
            logoClicks++;
            
            if (logoClickTimeout) clearTimeout(logoClickTimeout);
            
            logoClickTimeout = setTimeout(() => {
                logoClicks = 0;
            }, 3000);

            if (logoClicks >= 5) {
                logoClicks = 0;
                elWatermarkModal.classList.remove('hidden');
                showToast('Autenticidade Confirmada', 'Carregando assinatura digital do desenvolvedor...', 'success');
            }
        });

        elBtnCloseWatermark.addEventListener('click', () => {
            elWatermarkModal.classList.add('hidden');
        });

        // Import Tab Navigation
        elImportTabNavs.forEach(btn => {
            btn.addEventListener('click', () => {
                elImportTabNavs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetTabId = btn.getAttribute('data-import-tab');
                elImportTabContents.forEach(content => {
                    if (content.id === targetTabId) {
                        content.classList.remove('hidden');
                        content.classList.add('active');
                    } else {
                        content.classList.add('hidden');
                        content.classList.remove('active');
                    }
                });
            });
        });

        // Process Pasted Text List
        elBtnImportText.addEventListener('click', () => {
            const text = elImportTextArea.value.trim();
            if (!text) {
                showToast('Aviso', 'Por favor, cole alguma lista de contatos antes de processar.', 'warning');
                return;
            }
            parseTextList(text);
        });

        // Dropzone drag and drop
        ['dragenter', 'dragover'].forEach(eventName => {
            elCsvDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                elCsvDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            elCsvDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                elCsvDropzone.classList.remove('dragover');
            }, false);
        });

        elCsvDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        elCsvFileInput.addEventListener('change', (e) => {
            if (elCsvFileInput.files.length > 0) {
                handleFile(elCsvFileInput.files[0]);
            }
        });

        function handleFile(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                parseCSV(e.target.result);
            };
            reader.readAsText(file, 'UTF-8');
        }

        elBtnDownloadTemplate.addEventListener('click', downloadTemplateCSV);

        // Toggle Manual Input Form
        elBtnToggleManual.addEventListener('click', () => {
            elManualForm.classList.toggle('hidden');
        });

        elBtnCancelManual.addEventListener('click', () => {
            elManualForm.classList.add('hidden');
        });

        // Manual Contact Submit
        elManualForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = elInputName.value.trim();
            const rawPhone = elInputPhone.value.trim();
            const email = elInputEmail.value.trim();
            const extraVar = elInputVar.value.trim();

            const cleanPhone = formatPhoneNumber(rawPhone);

            if (!name || !cleanPhone) {
                showToast('Erro no Cadastro', 'Nome e Telefone são obrigatórios.', 'error');
                return;
            }

            if (state.contacts.some(c => c.telefone === cleanPhone)) {
                showToast('Contato já existe', 'Este número de telefone já está na lista.', 'warning');
                return;
            }

            const newContact = {
                id: 'contact_' + Date.now(),
                nome: name,
                telefone: cleanPhone,
                email: email,
                variavel: extraVar,
                status: 'pending'
            };

            state.contacts.push(newContact);
            state.selectedContactId = newContact.id;
            
            saveState();
            updateMetrics();
            renderTable();
            updateLivePreview();
            
            elManualForm.reset();
            elManualForm.classList.add('hidden');
            
            showToast('Contato Adicionado', `${name} foi adicionado à lista.`, 'success');
        });

        // Templates Change Listeners
        elTemplateWa.addEventListener('input', (e) => {
            state.templates.whatsapp = e.target.value;
            saveState();
            updateLivePreview();
        });

        elTemplateEmailSubject.addEventListener('input', (e) => {
            state.templates.emailSubject = e.target.value;
            saveState();
            updateLivePreview();
        });

        elTemplateEmailBody.addEventListener('input', (e) => {
            state.templates.emailBody = e.target.value;
            saveState();
            updateLivePreview();
        });

        elTemplateWa.addEventListener('focus', () => lastActiveTextarea = elTemplateWa);
        elTemplateEmailSubject.addEventListener('focus', () => lastActiveTextarea = elTemplateEmailSubject);
        elTemplateEmailBody.addEventListener('focus', () => lastActiveTextarea = elTemplateEmailBody);

        // Tab switches
        elTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetTab = btn.getAttribute('data-tab');
                elTabContents.forEach(content => {
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                state.activeTab = targetTab === 'tab-whatsapp' ? 'whatsapp' : 'email';
                lastActiveTextarea = state.activeTab === 'whatsapp' ? elTemplateWa : elTemplateEmailBody;

                updateLivePreview();
            });
        });

        // Variable Badges click
        elVarBadges.forEach(badge => {
            badge.addEventListener('click', () => {
                const varPlaceholder = badge.getAttribute('data-var');
                const textarea = lastActiveTextarea;
                
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                const text = textarea.value;
                
                textarea.value = text.substring(0, startPos) + varPlaceholder + text.substring(endPos, text.length);
                
                textarea.focus();
                textarea.selectionStart = startPos + varPlaceholder.length;
                textarea.selectionEnd = startPos + varPlaceholder.length;

                textarea.dispatchEvent(new Event('input'));
            });
        });

        // Table filters
        elFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentFilter = btn.getAttribute('data-filter');
                renderTable();
            });
        });

        // Search input
        elSearchContacts.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderTable();
        });

        elBtnClearAll.addEventListener('click', clearAllContacts);
        elBtnExportCsv.addEventListener('click', exportCSV);
        elBtnStartAutomation.addEventListener('click', startSequentialAutomation);

        elBtnSaveBackup.addEventListener('click', saveBackupToFile);
        elBtnLoadBackup.addEventListener('click', () => elBackupFileInput.click());
        elBackupFileInput.addEventListener('change', handleBackupFileSelect);

        elBtnCloseModal.addEventListener('click', () => {
            elAutomationModal.classList.add('hidden');
        });

        // Modal Channel tabs click
        elModalBtnWa.addEventListener('click', () => {
            state.automationChannel = 'wa';
            updateModalChannelTab();
            loadAutomationContact();
        });

        elModalBtnGmail.addEventListener('click', () => {
            state.automationChannel = 'gmail';
            updateModalChannelTab();
            loadAutomationContact();
        });

        elModalBtnMail.addEventListener('click', () => {
            state.automationChannel = 'mail';
            updateModalChannelTab();
            loadAutomationContact();
        });

        // Modal Action Buttons
        elModalBtnSend.addEventListener('click', sendCurrentAutomation);
        elModalBtnSkip.addEventListener('click', skipCurrentAutomation);
        elModalBtnManualSent.addEventListener('click', markCurrentAsSentManually);
    }

    init();
});
