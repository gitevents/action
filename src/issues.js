module.exports = exports = async function (github, context, core) {
  core.info('GitEvents Issue Parser')

  if (context.eventName === 'issues') {
    if (context.payload.action === 'opened') {
      if (context.payload.issue.labels.find((l) => l.name.includes('Talk:'))) {
        const fn = require('./lib/talk-created')
        await fn(github, context, core)
      }
    } else if (context.payload.action === 'edited') {
      if (context.payload.issue.labels.find((l) => l.name.includes('Talk:'))) {
        const fn = require('./lib/talk-edited')
        await fn(github, context, core)
      }
    }
  }
}
