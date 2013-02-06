_ = require('underscore')
Backbone = require('backbone')
jQuery = require('jQuery')
$ = require('jQuery')

window.HTA = do ->
  init: ->
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g

    Hta = Backbone.Model.extend
      file: ->
        return this.get('url').replace('http', 'file')
      ssh: ->
        return 'ssh://' + this.get('url').split('/')[2]?.replace(/:.*/, '')
      hta: ->
        return this.get('url').replace('http', 'hta')
      name: ->
        return encodeURI(this.get('name'))
      toFullJSON: ->
        return _.extend this.toJSON(),
            ssh: this.ssh()
            hta: this.hta()

    HtaCollection = Backbone.Collection.extend
      model: Hta
      url: ->
        return "x.php/htas"

    Tag = Backbone.Model.extend()
    TagCollection = Backbone.Collection.extend
      model: Tag
      url: "x.php/tags"

    TagView = Backbone.View.extend
      tagName: "div"
      render: ->
        template = $("#tagTemplate")
        html = _.template(template.text(), @model.toJSON())
        $(@el).append html

    HtaView = Backbone.View.extend
      tagName: "div"
      events:
        "click a.download": "handleDownload"
        "click a.launch": "handleLaunch"
        "click a.ssh": "handleSSH"
        "click a.delete": "handleDelete"
        "click a.copy": "handleCopy"

      handleDownload: (e) ->
        e.preventDefault()
        document.location.href = @model.file()

      handleLaunch: (e) ->
        e.preventDefault()
        document.location.href = @model.hta()

      handleSSH: (e) ->
        e.preventDefault()
        document.location.href = @model.ssh()

      handleDelete: (e) ->
        e.preventDefault()
        name = @model.get("name")
        bootbox.confirm "Are you sure you want to delete #{name}?", (confirmed) =>
          if (confirmed)
            @model.destroy
              success: ->
                $(e.currentTarget).parent().parent().fadeOut("slow")

      handleCopy: (e) ->
        e.preventDefault()
        $('#copyModal').modal('toggle').find('input').val([
          window.location.href,
          'x.php?op=load&name=' + @model.name()
        ].join('/'))

      render: ->
        template = $("#htaTemplate")
        html = _.template(template.text(), @model.toFullJSON())
        $(@el).append html

    NavView = Backbone.View.extend
      el: $("div.navbar")
      events:
        "click a#addhta": "handleAdd"
        "keypress #filter": "handleFilter"

      handleAdd: (e) ->
        e.preventDefault()
        new AddView({ el: $('#addModal') }).show()

      handleFilter: (e) ->
        return unless e.keyCode == 13
        name = $(e.currentTarget).val()
        App.Views.ListView.getCollection().fetch { data: { name: name } }, (->
          success: ->
        )

    AddView = Backbone.View.extend
      events:
        "click #saveHta": "handleAdd"

      initialize: ->
        @render()

      render: ->
          tags = new TagCollection
          tags.bind "reset", ->
            html = _.template $("#addSelectTemplate").html(), tags: tags.toJSON()
            $('#tags').append html
            $('.chzn-select').chosen()
          tags.fetch()

      handleAdd: ->
        App.Views.ListView.getCollection().create
          name: $(this.el).find('input[name=name]').val()
          url: $(this.el).find('input[name=url]').val()
          graphic: $(this.el).find('select[name=graphic] option:selected').val()
          tags: $(this.el).find("select[name=tags] option:selected").map(->
            return this.value
          ).get().join(",")

      show: ->
        $(this.el).modal('toggle')

    HtaTagView = Backbone.View.extend
      tagName: "ul"
      className: "nav nav-list"

      initialize: ->
        _.bindAll this, "renderItem", "render", "getCollection"
        @collection.bind('reset', @render)
        @collection.bind('add', @renderItem)

      renderItem: (model) ->
        tagView = new TagView(model: model)
        tagView.render()
        $(@el).append tagView.el

      render: ->
        $(@el).empty()
        @collection.each @renderItem
        $("#htaTag").html @el

      getCollection: ->
        return @collection

    HtaListView = Backbone.View.extend
      tagName: "div"

      initialize: ->
        _.bindAll this, "renderItem", "render", "getCollection"
        @collection.bind('reset', @render)
        @collection.bind('add', @renderItem)
        new NavView()

      renderItem: (model) ->
        htaView = new HtaView(model: model)
        htaView.render()
        $(@el).prepend(htaView.el).find('[rel=tooltip]').tooltip()
        return htaView

      render: ->
        $(@el).empty()
        @collection.each @renderItem
        $("#htaList").html @el
        $("[rel=tooltip]").tooltip()

      getCollection: ->
        return @collection

    App =
      Views: {}
      Routers: {}
      init: ->
        new AppRouter
        Backbone.history.start()

    AppRouter = Backbone.Router.extend
      routes:
        "": "index"
        "tagged/:tag": "tagged"

      index: ->
        htas = new HtaCollection
        App.Views.ListView = new HtaListView(collection: htas)
        htas.fetch
          success: ->
        tags = new TagCollection
        App.Views.TagView = new HtaTagView(collection: tags)
        tags.fetch
          success: ->

      tagged: (tag) ->
        htas = new HtaCollection
        App.Views.ListView = new HtaListView(collection: htas)
        App.Views.ListView.getCollection().fetch { data: { tag: tag } }, (->
          success: ->
        )
        tags = new TagCollection
        App.Views.TagView = new HtaTagView(collection: tags)
        tags.fetch
          success: ->

    App.init()

$ ->
  HTA.init()
