
window.HTA = (function() {
  return {
    init: function() {
      var AddView, App, AppRouter, Hta, HtaCollection, HtaListView, HtaTagView, HtaView, NavView, Tag, TagCollection, TagView;
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
      Hta = Backbone.Model.extend({
        file: function() {
          return this.get('url').replace('http', 'file');
        },
        ssh: function() {
          var _ref;
          return 'ssh://' + ((_ref = this.get('url').split('/')[2]) != null ? _ref.replace(/:.*/, '') : void 0);
        },
        hta: function() {
          return this.get('url').replace('http', 'hta');
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
        url: "x.php/htas"
      });
      Tag = Backbone.Model.extend();
      TagCollection = Backbone.Collection.extend({
        model: Tag,
        url: "x.php/tags"
      });
      TagView = Backbone.View.extend({
        tagName: "div",
        render: function() {
          var html, template;
          template = $("#tagTemplate");
          html = _.template(template.text(), this.model.toJSON());
          return $(this.el).append(html);
        }
      });
      HtaView = Backbone.View.extend({
        tagName: "div",
        events: {
          "click a.download": "handleDownload",
          "click a.launch": "handleLaunch",
          "click a.ssh": "handleSSH",
          "click a.delete": "handleDelete",
          "click a.copy": "handleCopy"
        },
        handleDownload: function(e) {
          e.preventDefault();
          return document.location.href = this.model.file();
        },
        handleLaunch: function(e) {
          e.preventDefault();
          return document.location.href = this.model.hta();
        },
        handleSSH: function(e) {
          e.preventDefault();
          return document.location.href = this.model.ssh();
        },
        handleDelete: function(e) {
          var name,
            _this = this;
          e.preventDefault();
          name = this.model.get("name");
          return bootbox.confirm("Are you sure you want to delete " + name + "?", function(confirmed) {
            if (confirmed) {
              return _this.model.destroy({
                success: function() {
                  return $(e.currentTarget).parent().parent().fadeOut("slow");
                }
              });
            }
          });
        },
        handleCopy: function(e) {
          e.preventDefault();
          return $('#copyModal').modal('toggle').find('input').val([window.location.href, 'x.php?op=load&name=' + this.model.name()].join('/'));
        },
        render: function() {
          var html, template;
          template = $("#htaTemplate");
          html = _.template(template.text(), this.model.toFullJSON());
          return $(this.el).append(html);
        }
      });
      NavView = Backbone.View.extend({
        el: $("div.navbar"),
        events: {
          "click a#addhta": "handleAdd",
          "keydown #filter": "handleFilter"
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
            data: {
              name: name
            }
          }, (function() {
            return {
              success: function() {}
            };
          }));
        }
      });
      AddView = Backbone.View.extend({
        events: {
          "click #saveHta": "handleAdd"
        },
        initialize: function() {
          return $('.chzn-select').chosen();
        },
        handleAdd: function() {
          return App.Views.ListView.getCollection().create({
            name: $(this.el).find('input[name=name]').val(),
            url: $(this.el).find('input[name=url]').val(),
            graphic: $(this.el).find('select[name=graphic] option:selected').val(),
            tags: $(this.el).find("select[name=tags] option:selected").map(function() {
              return this.value;
            }).get().join(",")
          });
        },
        show: function() {
          return $(this.el).modal('toggle');
        }
      });
      HtaTagView = Backbone.View.extend({
        tagName: "ul",
        className: "nav nav-list",
        initialize: function() {
          _.bindAll(this, "renderItem", "render", "getCollection");
          this.collection.bind('reset', this.render);
          return this.collection.bind('add', this.renderItem);
        },
        renderItem: function(model) {
          var tagView;
          tagView = new TagView({
            model: model
          });
          tagView.render();
          return $(this.el).append(tagView.el);
        },
        render: function() {
          $(this.el).empty();
          this.collection.each(this.renderItem);
          return $("#htaTag").html(this.el);
        },
        getCollection: function() {
          return this.collection;
        }
      });
      HtaListView = Backbone.View.extend({
        tagName: "div",
        initialize: function() {
          _.bindAll(this, "renderItem", "render", "getCollection");
          this.collection.bind('reset', this.render);
          this.collection.bind('add', this.renderItem);
          return new NavView();
        },
        renderItem: function(model) {
          var htaView;
          htaView = new HtaView({
            model: model
          });
          htaView.render();
          $(this.el).prepend(htaView.el).find('[rel=tooltip]').tooltip();
          return htaView;
        },
        render: function() {
          $(this.el).empty();
          this.collection.each(this.renderItem);
          $("#htaList").html(this.el);
          return $("[rel=tooltip]").tooltip();
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
          "": "index"
        },
        index: function() {
          var htas, tags;
          htas = new HtaCollection;
          App.Views.ListView = new HtaListView({
            collection: htas
          });
          htas.fetch({
            success: function() {}
          });
          tags = new TagCollection;
          App.Views.TagView = new HtaTagView({
            collection: tags
          });
          return tags.fetch({
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
