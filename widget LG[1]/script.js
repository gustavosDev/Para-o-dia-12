define(['jquery'], function ($) {
    var CustomWidget = function () {
        var self = this;
        let token = null;
        let leadsFiltrados = [];

        this.callbacks = {
            render: function () {
                // Carrega as configs salvas para preencher os inputs
                const settings = self.get_settings();

                var html = `
                <style>
                                    .inactive-leads-widget {
                      font-family: Arial, sans-serif;
                      background-color: #f4f7fc;
                      padding: 20px;
                    }

                    .inactive-leads-widget .ilw-container {
                      background: #fff;
                      border-radius: 8px;
                      padding: 20px;
                      box-shadow: 0 0 12px rgba(0,0,0,0.1);
                    }

                    .inactive-leads-widget button {
                      margin: 10px 5px;
                      padding: 10px 20px;
                      font-size: 14px;
                      border: none;
                      border-radius: 6px;
                      cursor: pointer;
                      background-color: #007bff;
                      color: #fff;
                    }

                    .inactive-leads-widget button.ilw-hidden {
                      display: none;
                    }

                    .inactive-leads-widget #ilw-loader {
                      font-weight: bold;
                      margin: 10px 0;
                    }

                    .inactive-leads-widget .ilw-lead-card {
                      border: 1px solid #ccc;
                      background-color: #eef;
                      padding: 10px;
                      margin: 10px 0;
                      border-radius: 6px;
                    }

                </style>

                    <div class="inactive-leads-widget">
                        <div class="ilw-container">
                            <h2>📋 Gerenciador de Leads Inativos</h2>

                            <div class="ilw-config">
                                <label>Login: <input type="text" id="login" value="${settings.login || ''}" /></label><br>
                                <label>API Key: <input type="text" id="api_key" value="${settings.api_key || ''}" /></label><br>
                                <label>Account: <input type="text" id="account" value="${settings.account || ''}" /></label><br>
                            </div>

                            <button id="ilw-verificar-btn">🔍 Verificar Leads</button>
                            <button id="ilw-criar-tarefa-btn" class="ilw-hidden">📅 Criar Tarefas</button>

                            <div id="ilw-loader" class="ilw-hidden">⏳ Carregando...</div>
                            <div id="ilw-resultado"></div>
                        </div>
                    </div>
                    
                `;

                self.render_template({
                    caption: { class_name: "widget-caption" },
                    body: "",
                    render: html
                });

                // bind de eventos após o render
                self.bindUI();

                return true;
            },

            onSave: function () {
      
               const promessa = new Promise((resolve, reject)=> {
                const login = document.getElementById("login")?.value|| '';
                const apiKey = document.getElementById("api_key")?.value || '';
                const account = document.getElementById("account")?.value || '';

                // salva as configurações no Kommo
                self.set_settings({
                    login: login,
                    api_key: apiKey,
                    account: account
                });
             
                console.log("Configurações salvas:", { login, apiKey, account });  
                resolve(true)
               })
                return promessa ;
            },

            init: function () {
             var settings = self.get_settings();

        var css_path = settings.path + "/style.css?v=" + settings.version;
        // Adiciona o HTML do widget ao corpo do documento
        if ($('link[href="' + css_path + '"]').length < 1) {
          $("head").append(
            '<link href="' + css_path + '" type="text/css" rel="stylesheet">'
          );
        }

                console.log("Widget inicializado");
                return true;
            },

            bind_actions: function () {
                console.log("Bind actions executado");
                return true;
            }
        };

       

        this.bindUI = function () {
            const verificarBtn = document.getElementById('ilw-verificar-btn');
            const criarTarefaBtn = document.getElementById('ilw-criar-tarefa-btn');
            const resultadoDiv = document.getElementById('ilw-resultado');
            const loader = document.getElementById('ilw-loader');

            if (verificarBtn) {
                verificarBtn.addEventListener('click', async () => {
                    loader.classList.remove('ilw-hidden');
                    criarTarefaBtn.classList.add('ilw-hidden');

                    try {
                        await obterToken();
                        const leads = await getLeads();
                        leadsFiltrados = filtrarLeads(leads);
                        exibirResultado(leadsFiltrados);
                    } catch (err) {
                        resultadoDiv.innerHTML = `<p style="color: red;">Erro: ${err.message}</p>`;
                    } finally {
                        loader.classList.add('ilw-hidden');
                    }
                });
            }

            if (criarTarefaBtn) {
                criarTarefaBtn.addEventListener('click', async () => {
                    loader.classList.remove('ilw-hidden');
                    try {
                        await criarTarefas(leadsFiltrados);
                    } catch (err) {
                        resultadoDiv.innerHTML += `<p style="color: red;">Erro: ${err.message}</p>`;
                    } finally {
                        loader.classList.add('ilw-hidden');
                    }
                });
            }
        };

        async function obterToken() {
            token = self.get_settings().api_key
            if (!token) throw new Error('Token não obtido');
        }

        async function getLeads() {
            const response = await fetch('/api/v4/leads?with=tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Erro ao buscar leads');
            const data = await response.json();
            return data._embedded.leads;
        }

        function filtrarLeads(leads) { 
         const cincoDiasAtras = Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60;

            return leads.filter(lead => {
                const semTarefa = !lead._embedded?.tasks || lead._embedded.tasks.length === 0;
                const dataUltimoContato = lead.last_contacted_at || lead.updated_at || 0;
                return semTarefa && dataUltimoContato < cincoDiasAtras;
            });
        }

        function exibirResultado(leads) {
            const resultadoDiv = document.getElementById('ilw-resultado');
            const criarTarefaBtn = document.getElementById('ilw-criar-tarefa-btn');

            resultadoDiv.innerHTML = '';
            if (leads.length === 0) {
                resultadoDiv.innerHTML = `<p>✅ Nenhum lead encontrado com mais de 5 dias sem contato e sem tarefas.</p>`;
                criarTarefaBtn.classList.add('ilw-hidden');
            } else {
                resultadoDiv.innerHTML = leads.map(lead => `
                    <div class="ilw-lead-card">
                        <strong>${lead.name || 'Sem nome'}</strong><br>
                        ID: ${lead.id}<br>
                        <a href="https://${self.get_settings().account || 'example'}.kommo.com/leads/detail/${lead.id}" target="_blank">Ver Lead</a>
                    </div>
                `).join('');
                criarTarefaBtn.classList.remove('ilw-hidden');
            }
        }

        async function criarTarefas(leads) {
            const resultadoDiv = document.getElementById('ilw-resultado');
            const criarTarefaBtn = document.getElementById('ilw-criar-tarefa-btn');

            if (leads.length === 0) throw new Error('Sem leads para agendar tarefas');

            const tarefas = leads.map(lead => ({
                text: 'Entrar em contato com o lead (5 dias sem contato)',
                complete_till: Math.floor(Date.now() / 1000) + 86400,
                entity_id: lead.id,
                entity_type: 'leads'
            }));

            const response = await fetch('/api/v4/tasks', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tarefas)
            });

            if (!response.ok) throw new Error('Erro ao criar tarefas');
            resultadoDiv.innerHTML += `<p style="color: green;">✅ ${tarefas.length} tarefas criadas com sucesso!</p>`;
            criarTarefaBtn.classList.add('ilw-hidden');
        }

        return this;
    };

    return CustomWidget;
});
