// routes/public.js
import express from "express"

export function publicRoutes(db) {
  const router = express.Router()

  // 檢查 username 是否可用
  router.get("/check-username", async (req, res) => {
    const { scope, username } = req.query // scope: user|club|company
    if (!["user", "club", "company"].includes(scope)) {
      return res.status(400).json({ error: "invalid scope" })
    }
    const table =
      scope === "user" ? "users" : scope === "club" ? "clubs" : "companies"
    const row = await db.get(`SELECT 1 FROM ${table} WHERE username = ?`, [
      username,
    ])
    res.json({ available: !row })
  })

  // 公開使用者
  router.get("/users/:username", async (req, res) => {
    const u = await db.get(
      `SELECT id, username, name, avatar, created_at
       FROM users WHERE username = ?`,
      [req.params.username]
    )
    if (!u) return res.status(404).json({ error: "使用者不存在" })
    res.json(u)
  })

  // 公開社團
  router.get("/clubs/:username", async (req, res) => {
    const c = await db.get(
      `SELECT username, school, name, info, activity, stars, avatar
       FROM clubs WHERE username = ?`,
      [req.params.username]
    )
    if (!c) return res.status(404).json({ error: "社團不存在" })
    const { count } = await db.get(
      `SELECT COUNT(*) AS count FROM club_users WHERE club_username = ?`,
      [c.username]
    )
    res.json({ ...c, memberCount: count })
  })

  // 公開公司
  router.get("/companies/:username", async (req, res) => {
    const co = await db.get(
      `SELECT username, business_no AS businessNo, name, info, stars, avatar
       FROM companies WHERE username = ?`,
      [req.params.username]
    )
    if (!co) return res.status(404).json({ error: "公司不存在" })
    const { count } = await db.get(
      `SELECT COUNT(*) AS count FROM company_users WHERE company_username = ?`,
      [co.username]
    )
    res.json({ ...co, memberCount: count })
  })

  // 公開貼文（社團 + 公司）
router.get("/posts", async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT p.id, p.title, p.content, p.tags, p.participants, p.budget, p.event_date, p.event_location,
             strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
             u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
             'club' AS orgType, c.username AS orgUsername, c.name AS orgName
      FROM club_posts p
      JOIN users u ON u.id = p.user_id
      JOIN clubs c ON c.username = p.club_username

      UNION ALL

      SELECT p.id, p.title, p.content, p.tags, p.participants, p.budget, p.event_date, p.event_location,
             strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
             u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
             'company' AS orgType, co.username AS orgUsername, co.name AS orgName
      FROM company_posts p
      JOIN users u ON u.id = p.user_id
      JOIN companies co ON co.username = p.company_username

      ORDER BY createdAt DESC
      LIMIT 50
    `)

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: "無法取得貼文列表" })
  }
})

  router.get("/users/:username/orgs", async (req, res) => {
    try {
        const { username } = req.params

        // 找使用者 id
        const u = await db.get(`SELECT id FROM users WHERE username = ?`, [username])
        if (!u) return res.status(404).json({ error: "使用者不存在" })

        // 加入的社團
        const clubs = await db.all(`
        SELECT c.username, c.name, c.school, c.avatar
        FROM clubs c
        JOIN club_users cu ON cu.club_username = c.username
        WHERE cu.user_id = ?
        ORDER BY c.name COLLATE NOCASE ASC
        `, [u.id])

        // 加入的公司
        const companies = await db.all(`
        SELECT co.username, co.name, co.business_no AS businessNo, co.avatar
        FROM companies co
        JOIN company_users cu ON cu.company_username = co.username
        WHERE cu.user_id = ?
        ORDER BY co.name COLLATE NOCASE ASC
        `, [u.id])

        res.json({ clubs, companies })
    } catch (err) {
        console.error("user orgs error:", err)
        res.status(500).json({ error: "無法取得使用者的組織" })
    }
  })

    router.get("/users/:username/posts", async (req, res) => {
      try {
          const { username } = req.params

          // 找 user id
          const u = await db.get(`SELECT id FROM users WHERE username = ?`, [username])
          if (!u) return res.status(404).json({ error: "使用者不存在" })

          const posts = await db.all(`
          SELECT p.id, p.content,
                  strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
                  u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
                  'club' AS orgType, c.username AS orgUsername, c.name AS orgName
          FROM club_posts p
          JOIN users u ON u.id = p.user_id
          JOIN clubs c ON c.username = p.club_username
          WHERE u.id = ?

          UNION ALL

          SELECT p.id, p.content,
                  strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
                  u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
                  'company' AS orgType, co.username AS orgUsername, co.name AS orgName
          FROM company_posts p
          JOIN users u ON u.id = p.user_id
          JOIN companies co ON co.username = p.company_username
          WHERE u.id = ?

          ORDER BY createdAt DESC
          `, [u.id, u.id])

          res.json(posts)
      } catch (err) {
          console.error("user posts error:", err)
          res.status(500).json({ error: "無法取得使用者貼文" })
      }
      })

      router.get("/search-users", async (req, res) => {
    const q = (req.query.q || "").trim().toLowerCase()
    if (!q) return res.json([])

    try {
      const rows = await db.all(
        `SELECT id, username, name, email, avatar
        FROM users
        WHERE username LIKE ? OR name LIKE ? OR email LIKE ?
        LIMIT 10`,
        [`%${q}%`, `%${q}%`, `%${q}%`]
      )
      res.json(rows)
    } catch (err) {
      res.status(500).json({ error: "搜尋使用者失敗" })
    }
  })
  router.get("/posts/:id", async (req, res) => {
    try {
      const { id } = req.params

      // 先找 club 貼文
      let row = await db.get(`
        SELECT p.id, p.title, p.content, p.tags, p.participants, p.budget, p.event_date, p.event_location,
              strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
              u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
              'club' AS orgType, c.username AS orgUsername, c.name AS orgName
        FROM club_posts p
        JOIN users u ON u.id = p.user_id
        JOIN clubs c ON c.username = p.club_username
        WHERE p.id = ?
      `, [id])

      // 找不到再找 company 貼文
      if (!row) {
        row = await db.get(`
          SELECT p.id, p.title, p.content, p.tags, p.participants, p.budget, p.event_date, p.event_location,
                strftime('%Y-%m-%dT%H:%M:%fZ', p.created_at) AS createdAt,
                u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar,
                'company' AS orgType, co.username AS orgUsername, co.name AS orgName
          FROM company_posts p
          JOIN users u ON u.id = p.user_id
          JOIN companies co ON co.username = p.company_username
          WHERE p.id = ?
        `, [id])
      }

      if (!row) return res.status(404).json({ error: "貼文不存在" })
      res.json(row)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "取得貼文失敗" })
    }
  })




  return router
}
