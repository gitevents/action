/* eslint-disable node/no-unsupported-features/es-syntax */
import invite from '../src/lib/gh-invite.js'
import context from './fixtures/push'

test('invite() should invite a user to the org', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: jest.fn().mockImplementation(() => {
        const err = new Error()
        err.status = 404
        throw err
      }),
      createInvitation: jest.fn()
    }
  }
  const core = {
    info: jest.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).toHaveBeenCalled()
})

test('invite() should skip the invite', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: jest.fn(),
      createInvitation: jest.fn()
    }
  }
  const core = {
    info: jest.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).not.toHaveBeenCalled()
})

test('invite() should skip with any other error', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: jest.fn().mockImplementation(() => {
        const err = new Error()
        err.status = 500
        throw err
      }),
      createInvitation: jest.fn()
    }
  }
  const core = {
    info: jest.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).not.toHaveBeenCalled()
})
