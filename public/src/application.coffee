window.HTA = do ->
  init: ->
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g

    Hta = Backbone.Model.extend
      download: ->
        return '../app/load/' + this.get('id')
      ssh: ->
        return 'ssh://' + this.get('url')?.split('/')[2]?.replace(/:.*/, '')
      hta: ->
        return this.get('url')?.replace('http', 'hta')
      name: ->
        return encodeURI(this.get('name'))
      toFullJSON: ->
        return _.extend this.toJSON(),
            ssh: this.ssh()
            hta: this.hta()

    HtaCollection = Backbone.Collection.extend
      model: Hta
      url: '../app/htas'

    HtaView = Backbone.View.extend
      tagName: 'div'
      className: 'row'
      events:
        'click button.download': 'handleDownload'
        'click button.launch': 'handleHTA'
        'click button.ssh': 'handleSSH'
        'click button.delete': 'handleDelete'
        'click button.copy': 'handleCopy'

      handleDownload: (e) ->
        e.preventDefault()
        document.location.href = @model.download()

      handleHTA: (e) ->
        e.preventDefault()
        document.location.href = @model.hta()

      handleSSH: (e) ->
        e.preventDefault()
        document.location.href = @model.ssh()

      handleDelete: (e) ->
        e.preventDefault()
        name = @model.get('name')
        bootbox.confirm "Are you sure you want to delete '#{name}'?", (confirmed) =>
          if (confirmed)
            @model.destroy
              success: ->
                App.Views.ListView.getCollection().fetch({ reset: true })

      handleCopy: (e) ->
        e.preventDefault()
        $('#copyModal').modal('toggle').find('input').val([
          window.location.href,
          '../app/load/' + @model.get('id')
        ].join('/'))

      render: ->
        template = $('#htaTemplate')
        html = _.template(template.text(), @model.toFullJSON())
        $(@el).append html

    NavView = Backbone.View.extend
      el: $('div.navbar')
      events:
        'click a#addhta': 'handleAdd'
        'keyup #filter': 'handleFilter'

      handleAdd: (e) ->
        e.preventDefault()
        new AddView({ el: $('#addModal') }).show()

      handleFilter: (e) ->
        name = $(e.currentTarget).val()
        url = $(e.currentTarget).val()
        App.Views.ListView.getCollection().fetch
          reset: true,
          data: 
            name: name
            url: url

    AddView = Backbone.View.extend
      events:
        'click #saveHta': 'handleAdd'

      initialize: ->
        @render()

      render: ->

      handleAdd: ->
        App.Views.ListView.getCollection().create
          name: $(this.el).find('input[name=name]').val()
          url: $(this.el).find('input[name=url]').val()
          graphic: $(this.el).find('select[name=graphic] option:selected').val()

      show: ->
        $(this.el).modal('toggle')

    HtaListView = Backbone.View.extend
      el: '#htaList'

      initialize: ->
        @listenTo(@collection, 'reset', @render)
        @listenTo(@collection, 'add', @renderItem)

      renderItem: (model) ->
        htaView = new HtaView(model: model)
        htaView.render()
        $(@el).prepend(htaView.el)

      render: ->
        $(@el).empty()
        @collection.each $.proxy(@renderItem, @)

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
        '': 'index'

      index: ->
        new NavView()

        htas = new HtaCollection
        App.Views.ListView = new HtaListView(collection: htas)
        htas.fetch
          reset: true
          success: ->

    App.init()

$ ->
  HTA.init()
