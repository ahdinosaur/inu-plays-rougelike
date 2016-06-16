const { start, pull, html } = require('inu')
const Tc = require('tcomb')
const getWsUrl = require('wsurl')

const app = require('./')
const Connect = require('./effects/connect')
const Keys = require('./effects/keys')
const Set = require('./actions/set')

const wsUrl = process.env.NODE_ENV === 'production'
  ? getWsUrl('//')
  : getWsUrl('//').split(/:[0-9]+\//)[0] + ':9965/'

const client = {
  init: () => ({
    model: null,
    effect: [
      Connect({
        url: wsUrl
      }),
      Keys({})
    ]
  }),

  update: (model, action) => {
    if (Set.is(action)) {
      return app.update(model, action)
    }
    // otherwise ignore action
    return { model }
  },

  view: (model, dispatch) => {
    if (!model) return null

    return html`
      <main>
        <pre>${
          app.view(model, dispatch)
        }</pre>
      </main>
    `
  },
    
  run: app.run
}

const streams = start(client)
const main = document.querySelector('main')

pull(
  streams.views(),
  pull.drain((view) => {
    html.update(main, view)
  })
)