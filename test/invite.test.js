/* eslint-disable node/no-unpublished-import */
import { test, expect, vi } from 'vitest'
import invite from '../src/lib/gh-invite.js'
import context from './fixtures/push'

test('invite() should invite a user to the org', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: vi.fn().mockImplementation(() => {
        const err = new Error()
        err.status = 404
        throw err
      }),
      createInvitation: vi.fn()
    }
  }
  const core = {
    info: vi.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).toHaveBeenCalled()
})

test('invite() should skip the invite', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: vi.fn(),
      createInvitation: vi.fn()
    }
  }
  const core = {
    info: vi.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).not.toHaveBeenCalled()
})

test('invite() should skip with any other error', async () => {
  const octokit = {
    orgs: {
      getMembershipForUser: vi.fn().mockImplementation(() => {
        const err = new Error()
        err.status = 500
        throw err
      }),
      createInvitation: vi.fn()
    }
  }
  const core = {
    info: vi.fn()
  }

  await invite(octokit, context, core)
  expect(octokit.orgs.getMembershipForUser).toHaveBeenCalled()
  expect(octokit.orgs.createInvitation).not.toHaveBeenCalled()
})
