define(['jquery', 'underscore'], function ($, _) {
  var CustomWidget = function () {
    var self = this;

    // ---------- Helpers ----------
    function getCfg() {
      var s = (typeof self.get_settings === 'function' ? self.get_settings() : {}) || {};
      return {
        bolo_enabled: !!s.bolo_enabled,
        entrevista_enabled: !!s.entrevista_enabled,
        tarefa_enabled: !!s.tarefa_enabled
      };
    }

    function saveCfg(partial) {
      var current = (typeof self.get_settings === 'function' ? self.get_settings() : {}) || {};
      var payload = Object.assign({}, current, partial || {});
      if (typeof self.save_settings === 'function') self.save_settings(payload);
      if (window.AMOCRM && AMOCRM.notifications) {
        AMOCRM.notifications.show_message({
          header: 'Configurações salvas',
          text: 'Preferências atualizadas com sucesso.',
          date: new Date()
        });
      }
      return payload;
    }

    // Container típico da página de advanced_settings + fallbacks
    var CONTAINERS = [
      '#list_page_holder',                 // mais comum nos builds atuais
      '#widget_settings__body',
      '.widget_settings__body',
      '.widget_settings_block__body',
      '.widget-settings__body',
      '#widget_settings__content',
      '.js-widget-settings-body',
      '.widget-settings-body',
      '.settings__page-body',
      '.settings__content',
      '.content__inner',
      '.content__body',
      '.content__page',
      '.widgets-card__content',
      '.widget-settings__wrap',
      '[data-widget-settings-body]',
      'body'                               // último recurso
    ];
    function findSettingsContainer() {
      for (var i = 0; i < CONTAINERS.length; i++) {
        var $w = $(CONTAINERS[i]);
        if ($w.length) return $w.first();
      }
      return $();
    }

    // Handlers da UI
    function bindHandlers() {
      $(document).off('.widgetadv');

      function readUI() {
        return {
          bolo_enabled: $('#toggle_bolo').is(':checked'),
          entrevista_enabled: $('#toggle_entrevista').is(':checked'),
          tarefa_enabled: $('#toggle_tarefa').is(':checked')
        };
      }
      function salvar() { saveCfg(readUI()); }
      function restaurarPadrao() { $('#toggle_bolo,#toggle_entrevista,#toggle_tarefa').prop('checked', false); }

      $(document).on('click.widgetadv', '#btn_salvar, #btn_salvar_b', salvar);
      $(document).on('click.widgetadv', '#btn_restaurar, #btn_restaurar_b', restaurarPadrao);
    }

    this.callbacks = {
      init: function () { return true; },

      // ====== AQUI vai o HTML e a injeção ======
      advancedSettings: function () {
        console.log('[Widget] advancedSettings: chamado');
        var t0 = Date.now();

        // HTML direto aqui dentro (o seu layout)
        var html = `
          <div id="widget-advanced-root" class="kembed">
            <style>
              .kembed{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#101828}
              .kembed .panel{max-width:980px;margin:0 auto;padding:8px 0}
              .kembed .topbar{display:flex;justify-content:flex-end;gap:8px;margin-bottom:16px}
              .kembed .btn{padding:10px 14px;border:none;border-radius:10px;font-weight:600;cursor:pointer;transition:.15s}
              .kembed .btn--primary{background:#2b7cff;color:#fff}
              .kembed .btn--primary:hover{background:#1f5ec4}
              .kembed .btn--secondary{background:#f5f5f7;color:#222;border:1px solid #e6e8ee}
              .kembed .grid{display:grid;gap:16px}
              @media(min-width:900px){.kembed .grid{grid-template-columns:1fr 1fr}}
              .kembed .card{background:#fff;border:1px solid #e6e8ee;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px}
              .kembed .card h3{margin:0;font-size:16px;line-height:1.2}
              .kembed .desc{color:#475467;font-size:13px;line-height:1.55}
              .kembed .switch{display:inline-flex;align-items:center;gap:10px;user-select:none}
              .kembed .switch input{display:none}
              .kembed .slider{position:relative;width:46px;height:26px;background:#e5e7eb;border-radius:999px;transition:.2s}
              .kembed .switch input:checked + .slider{background:#2b7cff}
              .kembed .switch input:checked + .slider::after{transform:translateX(20px)}
              .kembed .footer{margin-top:16px;display:flex;justify-content:flex-end;gap:10px}
            </style>

            <div class="panel">
              <div class="topbar">
                <button type="button" class="btn btn--secondary" id="btn_restaurar">Restaurar padrão</button>
                <button type="button" class="btn btn--primary" id="btn_salvar">Salvar configurações</button>
              </div>

              <div class="grid">
                <div class="card">
                  <div class="switch">
                    <label><input type="checkbox" id="toggle_bolo"><span class="slider"></span></label>
                    <strong>Automação “Bolo”</strong>
                  </div>
                  <h3>Identificar e mover leads que faltaram à visita</h3>
                  <p class="desc">Verifica leads que não compareceram e move para “bolo”, criando tarefa de follow-up.</p>
                </div>

                <div class="card">
                  <div class="switch">
                    <label><input type="checkbox" id="toggle_entrevista"><span class="slider"></span></label>
                    <strong>Atualização automática da data/hora da entrevista</strong>
                  </div>
                  <h3>Sincronizar “entrevista realizada”</h3>
                  <p class="desc">Ao marcar realizada conforme previsto, atualiza o campo de data/hora efetiva.</p>
                </div>

                <div class="card">
                  <div class="switch">
                    <label><input type="checkbox" id="toggle_tarefa"><span class="slider"></span></label>
                    <strong>Criar tarefa ao criar novo lead</strong>
                  </div>
                  <h3>Gatilho de primeiro contato</h3>
                  <p class="desc">Sempre que um novo lead for criado, gera tarefa automática para atendimento rápido.</p>
                </div>
              </div>

              <div class="footer">
                <button type="button" class="btn btn--secondary" id="btn_restaurar_b">Restaurar padrão</button>
                <button type="button" class="btn btn--primary" id="btn_salvar_b">Salvar configurações</button>
              </div>
            </div>
          </div>
        `;

        try {
          var $c = findSettingsContainer();
          if (!$c.length) {
            console.warn('[Widget] advancedSettings: container NÃO encontrado.');
            return true;
          }

          // injeta substituindo o conteúdo da página avançada
          $c.find('#widget-advanced-root').remove();
          $c.html(html);

          // estado inicial + eventos
          var cfg = getCfg();
          $('#toggle_bolo').prop('checked', cfg.bolo_enabled);
          $('#toggle_entrevista').prop('checked', cfg.entrevista_enabled);
          $('#toggle_tarefa').prop('checked', cfg.tarefa_enabled);
          bindHandlers();

          var ok = !!document.getElementById('widget-advanced-root');
          console[ok ? 'info' : 'error'](
            '[Widget] advancedSettings: %s em %dms (container=%s)',
            ok ? 'OK' : 'FALHOU',
            Date.now() - t0,
            $c.get(0) && ($c.get(0).id || $c.get(0).className || $c.get(0).nodeName)
          );
        } catch (e) {
          console.error('[Widget] advancedSettings: erro ->', e);
        }
        return true; // Kommo espera boolean
      },

      // chama o advancedSettings a partir do render quando a área for advanced_settings
      render: function () {
        try {
          var area = (self.system && typeof self.system === 'function') ? self.system().area : null;
          console.log('[Widget] render area:', area);
          if (area === 'advanced_settings') {
            console.log('[Widget] render(advanced_settings): chamando advancedSettings()');
            if (self.callbacks && typeof self.callbacks.advancedSettings === 'function') {
              self.callbacks.advancedSettings();
            }
          }
        } catch (e) { console.error('[Widget] render erro:', e); }
        return true;
      },

      bind_actions: function () { return true; },
      settings: function () { return true; },
      onSave: function () { return true; },

      destroy: function () {
        console.log('[Widget] destroy');
        $(document).off('.widgetadv');
      }
    };

    return this;
  };

  return CustomWidget;
});
