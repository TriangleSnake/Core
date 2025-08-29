import express from "express"

export function rosterRoutes(db) {
  const router = express.Router()

  router.get("/", async (req, res) => {
    try {
      const clubs = await db.all(`
        SELECT c.username, c.school, c.name, c.info, c.activity, c.stars,
               (SELECT COUNT(*) FROM club_users cu WHERE cu.club_username = c.username) AS memberCount
        FROM clubs c
        ORDER BY c.name COLLATE NOCASE ASC
      `)

      const companies = await db.all(`
        SELECT co.username, co.business_no AS businessNo, co.name, co.info, co.stars,
               (SELECT COUNT(*) FROM company_users cpu WHERE cpu.company_username = co.username) AS memberCount
        FROM companies co
        ORDER BY co.name COLLATE NOCASE ASC
      `)

      res.json({ clubs, companies })
    } catch (err) {
      res.status(500).json({ error: "無法取得名錄", detail: err.message })
    }
  })

  return router
}
