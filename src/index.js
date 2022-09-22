import core from '@actions/core'
import github from '@actions/github'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'

import setup from './setup.js'
import invite from './lib/gh-invite.js'
import issues from './issues.js'
import rsvp from './rsvp.js'

async function run() {
  core.info('Starting GitEvents...')
  // const appId = core.getInput('gitevents-app-id', {
  //   required: true
  // })
  // const appPrivateKey = core.getInput('gitevents-app-private-key', {
  //   required: true
  // })
  // const appInstallationId = core.getInput('gitevents-app-installation-id', {
  //   required: true
  // })
  // const enableAutoInvite = core.getInput('enable-auto-invite')

  // const octokit = new Octokit({
  //   authStrategy: createAppAuth,
  //   auth: {
  //     appId: appId,
  //     privateKey: appPrivateKey,
  //     installationId: appInstallationId
  //   }
  // })
  // const context = github.context
  // const { data: appUser } = await octokit.rest.apps.getAuthenticated()
  // const botUser = `${appUser.slug}[bot]`
  // context.botUser = botUser

  // for local integration testing
  const token = process.env.GITHUB_TOKEN
  const octokit = github.getOctokit(token)
  const context = github.context
  const enableAutoInvite = false

  // Commit "Enable GitEvents" to run the setup script
  // TODO: add more checks for sender permissions etc.
  if (
    context.eventName === 'push' &&
    context.payload.head_commit &&
    context.payload.head_commit.message === 'Enable GitEvents'
  ) {
    await setup(octokit, context, core)
  }

  if (!!enableAutoInvite === true) {
    await invite(octokit, context, core)
  }

  if (context.eventName === 'issues') {
    await issues(octokit, context, core)
  } else if (
    context.eventName === 'schedule' ||
    context.eventName === 'workflow_dispatch'
  ) {
    console.log('rsvp check')
    await rsvp(octokit, context, core)
  }
}

run()
