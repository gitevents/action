import ghComment from './gh-comment.js'

export default async function (github, context, core) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  if (
    context.payload.issue.body.includes(
      "- [ ] I've read and agree to the [Code of Conduct]"
    )
  ) {
    await github.rest.issues.addLabels({
      owner: owner,
      repo: repo,
      issue_number: context.payload.issue.number,
      labels: ['Pending: waiting for input']
    })
    await ghComment(github, context, core, 'comment-ack-coc')
  } else if (
    context.payload.issue.body.includes(
      "- [x] I've read and agree to the [Code of Conduct]"
    )
  ) {
    await ghComment(github, context, core, 'comment-first-response')
  }
}
