const ghComment = require('./gh-comment')

module.exports = exports = async function (github, context, core) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
  const giteventsBotUserLogin = core.getInput('gitevents-bot-login')

  if (
    context.payload.changes.body.from.includes(
      "- [ ] I've read and agree to the [Code of Conduct]"
    )
  ) {
    if (
      context.payload.issue.body.includes(
        "- [x] I've read and agree to the [Code of Conduct]"
      )
    ) {
      const { data: comments } = await github.rest.issues.listComments({
        owner: owner,
        repo: repo,
        issue_number: context.payload.issue.number
      })
      const comment = comments.find(
        (c) =>
          c.user.login === giteventsBotUserLogin &&
          c.body.includes('Code of Conduct')
      )
      await github.rest.issues.removeLabel({
        owner: owner,
        repo: repo,
        issue_number: context.payload.issue.number,
        name: 'Pending: waiting for input'
      })
      await github.rest.issues.addLabels({
        owner: owner,
        repo: repo,
        issue_number: context.payload.issue.number,
        labels: ['Pending: ready for review']
      })
      await ghComment(
        github,
        context,
        core,
        'comment-first-response',
        comment.id
      )
    }
  }
}
