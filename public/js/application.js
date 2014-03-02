// Generated by CoffeeScript 1.7.1
window.HTA = (function() {
  return {
    init: function() {
      var AddView, App, AppRouter, Hta, HtaCollection, HtaListView, HtaView, NavView;
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
      Hta = Backbone.Model.extend({
        download: function() {
          return '../app/load/' + this.get('id');
        },
        ssh: function() {
          var _ref, _ref1;
          return 'ssh://' + ((_ref = this.get('url')) != null ? (_ref1 = _ref.split('/')[2]) != null ? _ref1.replace(/:.*/, '') : void 0 : void 0);
        },
        hta: function() {
          var _ref;
          return (_ref = this.get('url')) != null ? _ref.replace('http', 'hta') : void 0;
        },
        name: function() {
          return encodeURI(this.get('name'));
        },
        toFullJSON: function() {
          return _.extend(this.toJSON(), {
            ssh: this.ssh(),
            hta: this.hta()
          });
        }
      });
      HtaCollection = Backbone.Collection.extend({
        model: Hta,
        url: '../app/htas'
      });
      HtaView = Backbone.View.extend({
        tagName: 'div',
        className: 'row',
        events: {
          'click button.download': 'handleDownload',
          'click button.launch': 'handleHTA',
          'click button.ssh': 'handleSSH',
          'click button.delete': 'handleDelete',
          'click button.copy': 'handleCopy'
        },
        handleDownload: function(e) {
          e.preventDefault();
          return document.location.href = this.model.download();
        },
        handleHTA: function(e) {
          e.preventDefault();
          return document.location.href = this.model.hta();
        },
        handleSSH: function(e) {
          e.preventDefault();
          return document.location.href = this.model.ssh();
        },
        handleDelete: function(e) {
          var name;
          e.preventDefault();
          name = this.model.get('name');
          return bootbox.confirm("Are you sure you want to delete '" + name + "'?", (function(_this) {
            return function(confirmed) {
              if (confirmed) {
                return _this.model.destroy({
                  success: function() {
                    return App.Views.ListView.getCollection().fetch({
                      reset: true
                    });
                  }
                });
              }
            };
          })(this));
        },
        handleCopy: function(e) {
          e.preventDefault();
          return $('#copyModal').modal('toggle').find('input').val([window.location.href, '../app/load/' + this.model.get('id')].join('/'));
        },
        render: function() {
          var html, template;
          template = $('#htaTemplate');
          html = _.template(template.text(), this.model.toFullJSON());
          return $(this.el).append(html);
        }
      });
      NavView = Backbone.View.extend({
        el: $('div.navbar'),
        events: {
          'click a#addhta': 'handleAdd',
          'keyup #filter': 'handleFilter'
        },
        handleAdd: function(e) {
          e.preventDefault();
          return new AddView({
            el: $('#addModal')
          }).show();
        },
        handleFilter: function(e) {
          var name;
          name = $(e.currentTarget).val();
          return App.Views.ListView.getCollection().fetch({
            reset: true,
            data: {
              name: name
            }
          });
        }
      });
      AddView = Backbone.View.extend({
        events: {
          'click #saveHta': 'handleAdd'
        },
        initialize: function() {
          return this.render();
        },
        render: function() {},
        handleAdd: function() {
          return App.Views.ListView.getCollection().create({
            name: $(this.el).find('input[name=name]').val(),
            url: $(this.el).find('input[name=url]').val(),
            graphic: $(this.el).find('select[name=graphic] option:selected').val()
          });
        },
        show: function() {
          return $(this.el).modal('toggle');
        }
      });
      HtaListView = Backbone.View.extend({
        el: '#htaList',
        initialize: function() {
          this.listenTo(this.collection, 'reset', this.render);
          return this.listenTo(this.collection, 'add', this.renderItem);
        },
        renderItem: function(model) {
          var htaView;
          htaView = new HtaView({
            model: model
          });
          htaView.render();
          return $(this.el).prepend(htaView.el);
        },
        render: function() {
          $(this.el).empty();
          return this.collection.each($.proxy(this.renderItem, this));
        },
        getCollection: function() {
          return this.collection;
        }
      });
      App = {
        Views: {},
        Routers: {},
        init: function() {
          new AppRouter;
          return Backbone.history.start();
        }
      };
      AppRouter = Backbone.Router.extend({
        routes: {
          '': 'index'
        },
        index: function() {
          var htas;
          new NavView();
          htas = new HtaCollection;
          App.Views.ListView = new HtaListView({
            collection: htas
          });
          return htas.fetch({
            reset: true,
            success: function() {}
          });
        }
      });
      return App.init();
    }
  };
})();

$(function() {
  return HTA.init();
});
