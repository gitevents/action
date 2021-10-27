const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  core.info('Starting GitEvents...')
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const context = github.context

  const enableAutoInvite = core.getInput('enable-auto-invite')
  console.log(process.env)
  // Commit "feat: set up GitEvents :tada:" to run the setup script
  // TODO: add more checks for sender permissions etc.
  if (
    context.eventName === 'push' &&
    context.payload.head_commit &&
    context.payload.head_commit.message === 'Enable GitEvents'
  ) {
    const setup = require('./setup.js')
    await setup(octokit, context, core)
  }

  if (!!enableAutoInvite === true) {
    const invite = require('./lib/gh-invite.js')
    await invite(octokit, context, core)
  }

  if (context.eventName === 'issues') {
    const issues = require('./issues.js')
    await issues(octokit, context, core)
  }
}

run()
