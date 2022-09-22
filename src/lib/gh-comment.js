import Mustache from 'mustache'
import fs from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function sendComment(
  github,
  context,
  core,
  file,
  commentId
) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
  // __dirname/../ is re-mapped to dist/ during build
  let path = join(__dirname, '../', 'templates')

  // TODO: add ability to use custom templates
  // const customTemplateFolder = core.getInput('templates-path')
  // if (customTemplateFolder) {
  //   path = customTemplateFolder
  // }

  const msg = fs.readFileSync(`${path}/${file}.md`, 'utf8')
  const template = Mustache.render(msg, {
    owner: owner,
    org: owner,
    repo: repo,
    context: context
  })

  if (commentId) {
    await github.rest.issues.updateComment({
      owner: owner,
      repo: repo,
      comment_id: commentId,
      body: template
    })
  } else {
    await github.rest.issues.createComment({
      issue_number: context.payload.issue.number,
      owner: owner,
      repo: repo,
      body: template
    })
  }
}
