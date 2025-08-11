define(['jquery', 'underscore'], function ($, _) {
  var CustomWidget = function () {
    var self = this;

    this.callbacks = {
      render: function () {
        console.log('[Menu Latera] render');
        return true;
      },
      init: function () {
        console.log('[Menu Latera] init');
        return true;
      },
      bind_actions: function () {
        console.log('[Menu Latera] bind_actions');
        return true;
      },
      settings: function () {
        console.log('[Menu Latera] settings aberto');
        $('#widget_settings__body').html(`
          <div style="padding:20px;font-family:Arial;">
            <h2>Configurações do Menu Latera</h2>
            <p>Este é um widget de teste que aparece como item separado no menu lateral.</p>
          </div>
        `);
        return true;
      },
      onSave: function () {
        console.log('[Menu Latera] configurações salvas');
        return true;
      },
      destroy: function () {
        console.log('[Menu Latera] destroy');
      }
    };

    return this;
  };

  return CustomWidget;
});