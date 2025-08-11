define(['jquery'], function($){
  var CustomWidget = function () {
        var self = this, // to access an object from methods
        system = self.system(), // this method returns an object with system variables.
        langs = self.langs;  // localization object with data from the localization file (i18n folder)
       
        this.callbacks = {
              settings: function(){
              },
              init: function(){      
                    return true;
              },
              bind_actions: function(){        
                    return true;
              },
              render: function(){  
                
                const settings = self.get_settings();

                var html = `
               <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
    }

    .card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      max-width: 800px;
      margin: 20px auto;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .card-description {
      color: #777;
      font-size: 14px;
      margin-top: 10px;
      line-height: 1.5;
    }

    .md-switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
    }

    .md-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .md-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.2s;
      border-radius: 34px;
    }

    .md-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: 0.2s;
    }

    input:checked + .md-slider {
      background-color: #3b82f6;
    }

    input:checked + .md-slider:before {
      transform: translateX(16px);
    }
  </style>

  <!-- Funcionalidade 1 -->
  <section class="card">
    <div class="card-header">
      <h3>Funcionalidade Bolo</h3>
      <label class="md-switch">
        <input type="checkbox" id="toggle_bolo">
        <span class="md-slider"></span>
      </label>
    </div>
    <p class="card-description">
      A funcionalidade "Bolo", ao ser ativada, move automaticamente os leads que não compareceram à visita agendada (sem justificativa) para a etapa "Bolo" no funil, e atribui a eles uma tarefa de acompanhamento.
    </p>
  </section>

  <!-- Funcionalidade 2 -->
  <section class="card">
    <div class="card-header">
      <h3>Atualização de data e hora da entrevista</h3>
      <label class="md-switch">
        <input type="checkbox" id="toggle_entrevista">
        <span class="md-slider"></span>
      </label>
    </div>
    <p class="card-description">
      Quando ativada, essa funcionalidade verifica os leads que tiveram entrevista marcada. Ao confirmar que a entrevista foi realizada conforme previsto, a automação atualiza automaticamente o campo "data da entrevista realizada" com a informação obtida no momento do comparecimento do cliente.
    </p>
  </section>

  <!-- Funcionalidade 3 -->
  <section class="card">
    <div class="card-header">
      <h3>Criar tarefa para novos leads</h3>
      <label class="md-switch">
        <input type="checkbox" id="toggle_novos_leads">
        <span class="md-slider"></span>
      </label>
    </div>
    <p class="card-description">
      Essa funcionalidade cria automaticamente uma tarefa de primeiro contato ou acompanhamento para todo novo lead criado na conta, garantindo que nenhum lead fique sem abordagem inicial.
    </p>
  </section>

                    
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
              dpSettings: function(){              
              },
              advancedSettings: function() {
              },
              destroy: function(){              
              },    
              contacts: { selected: function() {                  
                    }
              },
              onSalesbotDesignerSave: function (handler_code, params) {},
              leads: { selected: function() {                  
                    }
              },
              todo: { selected: function () {}
              },
              onSave: function () {},
              onAddAsSource: function (pipeline_id) {}
              };
        return this;
    };
  return CustomWidget;
});

function injectInto($c) {
      try {
        if ($c && $c.length) {
          console.log('[Widget] Injetando no container:', $c.get(0));
          $c.html(htmlAdvanced());
          $(document).off('click', '#test-btn').on('click', '#test-btn', function () {
            $('#test-msg').text('Botão clicado com sucesso!');
          });
          banner('✅ Injetado no container', 'rgba(30, 136, 229, .95)');
          return true;
        }
      } catch (e) {
        console.error('[Widget] Falha ao injetar no container:', e);
      }
      return false;
    }

    function injectFallbackBody() {
      console.warn('[Widget] Usando fallback: injetando no <body>');
      if (!document.getElementById('adv-root')) {
        $('body').append(htmlAdvanced());
        $(document).off('click', '#test-btn').on('click', '#test-btn', function () {
          $('#test-msg').text('Botão clicado (fallback BODY)!');
        });
        banner('⚠ Injetado no <body> (fallback)', 'rgba(255, 152, 0, .95)');
      }
    }

    function waitAndInject(timeoutMs) {
      var area = (self.system && typeof self.system === 'function') ? self.system().area : null;
      console.log('[Widget] waitAndInject — área:', area);
      if (area !== 'advanced_settings') {
        banner('Área atual não é advanced_settings', 'rgba(244,67,54,.95)');
        return;
      }

      // 1) tenta imediatamente
      var $c = findContainer();
      if (injectInto($c)) return;

      // 2) observa DOM por até X ms e injeta quando aparecer
      banner('⏳ Aguardando container...', 'rgba(117,117,117,.95)');
      var done = false;
      var obs = new MutationObserver(function () {
        if (done) return;
        var $try = findContainer();
        if ($try.length) {
          if (injectInto($try)) {
            done = true;
            obs.disconnect();
          }
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });

      setTimeout(function () {
        if (!done) {
          obs.disconnect();
          banner('⏰ Timeout container — usando fallback BODY', 'rgba(255, 87, 34, .95)');
          injectFallbackBody();
        }
      }, timeoutMs || 5000);
    }