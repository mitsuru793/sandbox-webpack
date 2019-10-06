const webpack = require('webpack')
const config = require('../webpack.config.js')
const compiler = webpack(config)
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} = require('tapable')

const log = console.log

// compiler.hooks.entryOption.tap('hi', () => log('clo'))
// compiler.run()
// const hook = new SyncHook(['arg1', 'arg2', 'arg3'])
// hook.tap('TestPlugin', () => log('hi'))
class Car {
  constructor() {
    this.hooks = {
      accelerates: new SyncHook(['newSpeed', 'oldSpeed']),
      brake: new SyncHook(),
      calculateRoutes: new AsyncParallelHook([
        'source',
        'target',
        'routesList',
      ]),
    }
  }

  setSpeed(newSpeed) {
    this.hooks.accelerate.call(newSpeed)
  }

  useNavigationSystemPromise(source, target) {
    const routesList = new List()
    return this.hooks.calculateRoutes
      .promise(source, target, routesList)
      .then(() => {
        return routesList.getRoutes()
      })
  }

  useNavigationSystemAsync(source, target, callback) {
    const routesList = new List()
    this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
      if (err) return callback(err)
      callback(null, routesList.getRoutes())
    })
  }
}

const myCar = new Car()

// tapで追加する引数の数だけ、引数名を渡す必要がある。
const hooks = new SyncHook(['arg1', 'arg2'])
hooks.tap('FirstLogger', (a, b) => console.log(`first log: ${a} ${b}`))
hooks.tap('SecondLogger', a => console.log(`second log ${a}`))
hooks.call(1, 2)

return
myCar.hooks.calculateRoutes.tapPromise(
  'GoogleMapsPlugin',
  (source, target, routesList) => {
    // return a promise
    return google.maps.findRoute(source, target).then(route => {
      routesList.add(route)
    })
  }
)
myCar.hooks.calculateRoutes.tapAsync(
  'BingMapsPlugin',
  (source, target, routesList, callback) => {
    bing.findRoute(source, target, (err, route) => {
      if (err) return callback(err)
      routesList.add(route)
      // call the callback
      callback()
    })
  }
)

// You can still use sync plugins
myCar.hooks.calculateRoutes.tap(
  'CachedRoutesPlugin',
  (source, target, routesList) => {
    const cachedRoute = cache.get(source, target)
    if (cachedRoute) routesList.add(cachedRoute)
  }
)

myCar.setSpeed(1)
