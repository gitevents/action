const core = require('@actions/core')
const github = require('@actions/github')
const { Octokit } = require('@octokit/rest')
const { createAppAuth } = require('@octokit/auth-app')

async function run() {
  core.info('Starting GitEvents...')
  const appId = core.getInput('gitevents-app-id')
  const appPrivateKey = core.getInput('gitevents-app-private-key')
  const appInstallationId = core.getInput('gitevents-app-installation-id')
  const enableAutoInvite = core.getInput('enable-auto-invite')

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appId,
      privateKey: appPrivateKey,
      installationId: appInstallationId
    }
  })
  const context = github.context

  const { data: appUser } = await octokit.rest.apps.getAuthenticated()
  const botUser = `${appUser.slug}[bot]`
  context.botUser = botUser

  // Commit "Enable GitEvents" to run the setup script
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
