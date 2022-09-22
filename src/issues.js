import create from './lib/talk-created.js'
import edit from './lib/talk-edited.js'

export default async function (github, context, core) {
  core.info('GitEvents Issue Parser')

  if (context.eventName === 'issues') {
    if (context.payload.action === 'opened') {
      if (context.payload.issue.labels.find((l) => l.name.includes('Talk:'))) {
        await create(github, context, core)
      }
    } else if (context.payload.action === 'edited') {
      if (context.payload.issue.labels.find((l) => l.name.includes('Talk:'))) {
        await edit(github, context, core)
      }
    }
  }
}
