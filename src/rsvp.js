export default async function query(octokit, context, core) {
  core.info('Querying for reactions')
  console.log(JSON.stringify(context, null, 2))
  // const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
  const owner = 'cyprus-developer-community'
  const repo = 'events'

  const query = `
    query reactions($owner: String!, $repo: String!, $size: Int!) {
      repository(name: $repo, owner: $owner) {
        issues(first: $size, filterBy: {states: OPEN}) {
          nodes {
            reactions(first: $size, content: THUMBS_UP) {
              nodes {
                user {
                  avatarUrl
                  databaseId
                  login
                }
              }
            }
            body
          }
        }
      }
    }
  `

  const { repository } = await octokit.graphql(query, {
    owner: owner,
    repo: repo,
    size: 100
  })
  console.log(JSON.stringify(repository, null, 2))
  const users = repository.issues.nodes
    .map((i) => {
      return i.reactions.nodes
        .map((r) => {
          return { login: r.user.login, id: r.user.databaseId }
        })
        .flat()
    })
    .flat()

  // mutation MyMutation {
  //   updateIssue(input: {id: "", body: ""})
  // }

  return
}
