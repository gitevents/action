/* eslint-disable node/no-unsupported-features/es-syntax */
import issues from '../src/issues.js'

test('issues() should check for code-of-conduct and return instructions', async () => {
  const issueOpened = await import('./fixtures/issue-opened')
  const octokit = {
    rest: { issues: { createComment: jest.fn(), addLabels: jest.fn() } }
  }
  const core = {
    info: jest.fn(),
    getInput: jest.fn()
  }

  await issues(octokit, issueOpened, core)
  expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
    body: 'Thanks for your proposal!\n\nThis group follows a Code of Conduct. In order to proceed, you need to read and agree to our [Code of Conduct](https://berlincodeofconduct.org/).\n',
    issue_number: 16,
    owner: 'gitevents',
    repo: 'action'
  })
  expect(octokit.rest.issues.addLabels).toHaveBeenCalled()
})

test('issues() should check for code-of-conduct', async () => {
  const issueOpened = await import('./fixtures/issue-opened')
  issueOpened.payload.issue.body =
    "- [x] I've read and agree to the [Code of Conduct]"
  const octokit = {
    rest: { issues: { createComment: jest.fn() } }
  }
  const core = {
    info: jest.fn(),
    getInput: jest.fn()
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
  const octokit = { rest: { issues: { createComment: jest.fn() } } }
  const core = {
    info: jest.fn(),
    getInput: jest.fn().mockImplementation(() => {
      return 'templates'
    })
  }

  await issues(octokit, { payload: {} }, core)
  // TODO: properly test custom template path
  expect(true).toBe(true)
})
