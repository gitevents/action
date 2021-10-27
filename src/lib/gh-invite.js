module.exports = exports = async function (github, context, core) {
  core.info('Checking membership and invitation status...')
  const [owner] = process.env.GITHUB_REPOSITORY.split('/')

  try {
    await github.orgs.getMembershipForUser({
      org: owner,
      username: context.payload.sender.login
    })
  } catch (err) {
    if (err.status === 404) {
      await github.orgs.createInvitation({
        org: owner,
        invitee_id: context.payload.sender.id
      })
    }
  }
}
