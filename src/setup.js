const fs = require('fs')
const { join } = require('path')

module.exports = exports = async function (github, context, core) {
  core.info('Starting GitEvents Setup')

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  const giteventsLabels = [
    {
      name: 'Approved :white_check_mark:',
      color: '2DA44E',
      description: 'approved & confirmed'
    },
    {
      name: 'Event: Feature :tickets:',
      color: '75F0AF',
      description: 'A feature event proposal.'
    },
    {
      name: 'Event :sparkles:',
      color: 'F075B7',
      description: 'An event proposal.'
    },
    {
      name: 'Sponsor Request :money_with_wings:',
      color: 'A63247',
      description: 'Sponsor an upcoming event.'
    },
    {
      name: 'New Idea :bulb:',
      color: 'F2F2F0',
      description: 'Any new ideas or suggestions to improve the event.'
    },
    {
      name: 'Talk: Feature :cinema:',
      color: '8BD9AD',
      description: 'Propose a longer talk. Maximum 25 minutes.'
    },
    {
      name: 'Talk: Lightning :zap:',
      color: '9AD9B5',
      description: 'Propose a short talk. Maximum 10 minutes.'
    },
    {
      name: 'Talk Request :love_letter:',
      color: '83A603',
      description:
        "Propose a topic you're really interested to hear a talk about."
    },
    {
      name: 'Pending: waiting for input',
      color: 'F7CB73',
      description: 'Waiting for input from the author.'
    },
    {
      name: 'Pending: ready for review',
      color: 'F29339',
      description: 'All checks passed. Ready for organizer review.'
    }
  ]
  const giteventsTeams = [
    {
      name: 'Organizers',
      maintainers: [context.payload.sender.id.toString()],
      privacy: 'closed'
    },
    {
      name: 'Co-Organizers',
      maintainers: [],
      privacy: 'closed'
    }
  ]

  const p = []
  const existingGiteventLabels = []
  try {
    const { data: defaultLabels } = await github.rest.issues.listLabelsForRepo({
      owner: owner,
      repo: repo,
      per_page: 100
    })

    defaultLabels.forEach((label) => {
      if (giteventsLabels.find((l) => l.name === label.name)) {
        existingGiteventLabels.push(label.name)
      } else {
        core.info(`Deleting label: ${label.name}`)
        p.push(
          github.rest.issues.deleteLabel({
            owner: owner,
            repo: repo,
            name: label.name
          })
        )
      }
    })

    await Promise.all(p)
  } catch (err) {
    core.debug('no existing issues found', err)
  }

  giteventsLabels.forEach((label) => {
    if (!existingGiteventLabels.includes(label.name)) {
      core.info(`Creating label: ${label.name}`)
      p.push(
        github.rest.issues.createLabel({
          owner: owner,
          repo: repo,
          name: label.name,
          color: label.color,
          description: label.description
        })
      )
    }
  })

  const teams = await github.rest.teams.list({
    org: owner
  })

  if (!teams || !teams.data || teams.data.length <= 0) {
    giteventsTeams.forEach((team) => {
      p.push(
        github.rest.teams.create({
          org: owner,
          name: team.name,
          maintainers: team.maintainers,
          privacy: team.privacy
        })
      )
    })
  }

  const path = join(__dirname, 'templates', 'issues')
  let files = [
    'event-feature.md',
    'event.md',
    'sponsor-request.md',
    'suggestion.md',
    'talk-feature.md',
    'talk-lightning.md',
    'talk-request.md'
  ]
  try {
    // check if the folder exists with the issue templates
    const committedTemplates = await github.rest.repos.getContent({
      owner: owner,
      repo: repo,
      path: '.github/ISSUE_TEMPLATE'
    })
    if (
      committedTemplates &&
      committedTemplates.data &&
      committedTemplates.data.length > 0
    ) {
      const filtered = committedTemplates.data.map((file) => {
        return file.name
      })
      files = files.filter((n) => !filtered.includes(n))
    }
  } catch (err) {
    core.debug('folder not found', err)
  }

  const { data: latestRef } = await github.rest.git.getRef({
    owner: owner,
    repo: repo,
    ref: 'heads/main'
  })

  const { data: latestCommit } = await github.rest.git.getCommit({
    owner: owner,
    repo: repo,
    commit_sha: latestRef.object.sha
  })

  const tree = []
  for (const file of files) {
    const content = fs.readFileSync(`${path}/${file}`, {
      encoding: 'base64'
    })
    const { data: blob } = await github.rest.git.createBlob({
      owner: owner,
      repo: repo,
      content: content,
      encoding: 'base64'
    })

    tree.push({
      path: `.github/ISSUE_TEMPLATE/${file}`,
      type: 'blob',
      mode: '100644',
      sha: blob.sha
    })
  }
  if (tree.length > 0) {
    const { data: gitTree } = await github.rest.git.createTree({
      owner: owner,
      repo: repo,
      tree: tree,
      base_tree: latestCommit.tree.sha
    })

    const { data: commit } = await github.rest.git.createCommit({
      owner: owner,
      repo: repo,
      message: 'chore: add issue templates by GitEvents',
      tree: gitTree.sha,
      author: { name: 'GitEvents', email: 'info@gitevents.org' },
      parents: [latestCommit.sha]
    })

    await github.rest.git.updateRef({
      owner: owner,
      repo: repo,
      ref: 'heads/main',
      sha: commit.sha
    })
  }

  try {
    await Promise.all(p)
  } catch (err) {
    console.log(err)
    core.error(err)
  }
}
