define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;

    // Onde o Kommo coloca a página de advanced settings
    function findContainer() {
      // em builds recentes, este é o container da página
      var $c = $('#list_page_holder');
      if ($c.length) return $c;

      // fallbacks (varia por tema/build)
      var alts = [
        '.widget_settings_block__body',
        '.widget-settings__body',
        '.widget_settings__body',
        '.settings__page-body',
        '#widget_settings__content',
        'body'
      ];
      for (var i = 0; i < alts.length; i++) {
        $c = $(alts[i]);
        if ($c.length) return $c;
      }
      return $('body');
    }

    // HTML mínimo de teste
    function htmlAdvanced() {
      return (
        '<div id="widget-advanced-root" ' +
          'style="padding:24px;font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;">' +
          '✅ <strong>Deu certo!</strong> Sua página <em>Advanced Settings</em> está renderizando.' +
        '</div>'
      );
    }

    // monta a página e loga sucesso/erro
    function mount() {
      var t0 = Date.now();
      try {
        var $c = findContainer();
        if (!$c.length) {
          console.warn('[Widget] mount: container NÃO encontrado.');
          return false;
        }
        $c.find('#widget-advanced-root').remove();
        $c.html(htmlAdvanced());

        var ok = !!document.getElementById('widget-advanced-root');
        console[ok ? 'info' : 'error'](
          '[Widget] mount: %s em %dms (container=%s)',
          ok ? 'OK' : 'FALHOU',
          Date.now() - t0,
          $c.get(0)?.id || $c.get(0)?.className || $c.get(0)?.nodeName
        );
        return ok;
      } catch (e) {
        console.error('[Widget] mount: erro ->', e);
        return false;
      }
    }

    this.callbacks = {
      init: function () { return true; },

      // callback oficial da página Advanced Settings
      advancedSettings: function () {
        console.log('[Widget] advancedSettings: chamado');
        var ok = mount();
        console[ok ? 'log' : 'warn']('[Widget] advancedSettings: render %s', ok ? 'SUCESSO' : 'FALHOU');
        return true;
      },

      // fallback defensivo caso algum build chame via render
      render: function () {
        try {
          var area = (self.system && typeof self.system === 'function') ? self.system().area : null;
          if (area === 'advanced_settings') {
            console.log('[Widget] render(advanced_settings): chamado');
            var ok = mount();
            console[ok ? 'log' : 'warn']('[Widget] render(advanced_settings): %s', ok ? 'OK' : 'FALHOU');
          }
        } catch (e) { console.error('[Widget] render erro:', e); }
        return true;
      },

      bind_actions: function () { return true; },
      settings: function () { return true; },
      onSave: function () { return true; },
      destroy: function () { /* cleanup se precisar */ }
    };

    return this;
  };

  return CustomWidget;
});
