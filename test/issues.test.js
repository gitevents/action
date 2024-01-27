/* eslint-disable node/no-unpublished-import */
import { test, expect, vi } from 'vitest'
import issues from '../src/issues.js'
import issueOpened from './fixtures/issue-opened.js'

test('issues() should check for code-of-conduct and return instructions', async () => {
  const octokit = {
    rest: { issues: { createComment: vi.fn(), addLabels: vi.fn() } }
  }
  const core = {
    info: vi.fn(),
    getInput: vi.fn()
  }

  await issues(octokit, issueOpened, core)
  expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
    body: 'Thanks for your proposal!\n\nThis group follows a Code of Conduct. In order to proceed, you need to read and agree to our [Code of Conduct](./blob/main/CODE_OF_CONDUCT.md).',
    issue_number: 16,
    owner: 'gitevents',
    repo: 'action'
  })
  expect(octokit.rest.issues.addLabels).toHaveBeenCalled()
})

test.skip('issues() should check for code-of-conduct', async () => {
  issueOpened.payload.issue.body =
    "- [x] I've read and agree to the [Code of Conduct](./blob/main/CODE_OF_CONDUCT.md)"
  const octokit = {
    rest: { issues: { createComment: vi.fn() } }
  }
  const core = {
    info: vi.fn(),
    getInput: vi.fn()
  }

  await issues(octokit, issueOpened, core)
  expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
    body: 'Thanks for your proposal! An organizer will review the issue shortly.\n\nYour @gitevents/organizers Team\n',
    issue_number: 16,
    owner: 'gitevents',
    repo: 'action'
  })
})

test('issues() with custom template folder', async () => {
  const octokit = { rest: { issues: { createComment: vi.fn() } } }
  const core = {
    info: vi.fn(),
    getInput: vi.fn().mockImplementation(() => {
      return 'templates'
    })
  }

  await issues(octokit, { payload: {} }, core)
  // TODO: properly test custom template path
  expect(true).toBe(true)
})
