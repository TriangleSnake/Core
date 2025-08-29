// utils/permissions.js
export async function requireClubMember(db, clubUsername, userId) {
  const member = await db.get(
    `SELECT role FROM club_users WHERE club_username = ? AND user_id = ?`,
    [clubUsername, userId]
  )
  if (!member) {
    const err = new Error("必須是成員才能操作")
    err.status = 403
    throw err
  }
  return member // { role: "member" | "owner" | "admin" }
}

export async function requireClubOwner(db, clubUsername, userId) {
  const member = await requireClubMember(db, clubUsername, userId)
  if (member.role !== "owner") {
    const err = new Error("只有社團管理者能操作")
    err.status = 403
    throw err
  }
  return true
}