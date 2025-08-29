// routes/chats.js
import express from "express"
import crypto from "crypto"
import { requireAuth } from "../middleware/auth.js"

async function getOrCreateOrgOfficialChat(db, { orgType, orgUsername, titleFallback }) {
  if (orgType === "club") {
    let chat = await db.get(
      `SELECT id FROM chats WHERE is_group = 1 AND club_username = ? LIMIT 1`,
      [orgUsername]
    )
    if (chat) return chat.id

    // 沒有就建
    const club = await db.get(`SELECT username, name FROM clubs WHERE username = ?`, [orgUsername])
    if (!club) throw Object.assign(new Error("社團不存在"), { status: 404 })
    const chatId = crypto.randomUUID()
    await db.run(
      `INSERT INTO chats (id, is_group, title, club_username, company_username, post_id)
       VALUES (?, 1, ?, ?, NULL, NULL)`,
      [chatId, `${club.name} 官方群組`, club.username]
    )
    return chatId
  } else if (orgType === "company") {
    let chat = await db.get(
      `SELECT id FROM chats WHERE is_group = 1 AND company_username = ? LIMIT 1`,
      [orgUsername]
    )
    if (chat) return chat.id

    const co = await db.get(`SELECT username, name FROM companies WHERE username = ?`, [orgUsername])
    if (!co) throw Object.assign(new Error("公司不存在"), { status: 404 })
    const chatId = crypto.randomUUID()
    await db.run(
      `INSERT INTO chats (id, is_group, title, club_username, company_username, post_id)
       VALUES (?, 1, ?, NULL, ?, NULL)`,
      [chatId, `${co.name} 官方群組`, co.username]
    )
    return chatId
  }
  throw Object.assign(new Error("orgType 無效"), { status: 400 })
}

export function chatsRoutes(db, jwtSecret) {
  const router = express.Router()

  // 建立 / 取得 1-1 聊天室（用對方 userId；可選綁定 post/club/company）
  router.post("/dm", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { peerUserId, postId, clubUsername, companyUsername } = req.body || {}
      if (!peerUserId) return res.status(400).json({ error: "缺少 peerUserId" })
      const me = req.user.id

      // 先找是否已有同成員的 1-1 聊天
      const existing = await db.get(`
        SELECT c.id
        FROM chats c
        JOIN chat_members m1 ON m1.chat_id = c.id AND m1.user_id = ?
        JOIN chat_members m2 ON m2.chat_id = c.id AND m2.user_id = ?
        WHERE c.is_group = 0
        LIMIT 1
      `, [me, peerUserId])

      if (existing) {
        return res.json({ id: existing.id })
      }

      const chatId = crypto.randomUUID()
      await db.run(`
        INSERT INTO chats (id, is_group, title, club_username, company_username, post_id)
        VALUES (?, 0, NULL, ?, ?, ?)
      `, [chatId, clubUsername || null, companyUsername || null, postId || null])

      await db.run(`INSERT INTO chat_members (chat_id, user_id, role, last_read_at) VALUES (?, ?, 'owner', CURRENT_TIMESTAMP)`, [chatId, me])
      await db.run(`INSERT INTO chat_members (chat_id, user_id, role, last_read_at) VALUES (?, ?, 'member', CURRENT_TIMESTAMP)`, [chatId, peerUserId])

      res.status(201).json({ id: chatId })
    } catch (err) {
      res.status(500).json({ error: "建立私訊失敗", detail: err.message })
    }
  })

  // 建立群組聊天室（可綁社團/公司/貼文）
  router.post("/group", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { title, memberIds = [], clubUsername, companyUsername, postId } = req.body || {}
      if (!title) return res.status(400).json({ error: "缺少 title" })
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: "缺少成員" })
      }

      const chatId = crypto.randomUUID()
      await db.run(`
        INSERT INTO chats (id, is_group, title, club_username, company_username, post_id)
        VALUES (?, 1, ?, ?, ?, ?)
      `, [chatId, title, clubUsername || null, companyUsername || null, postId || null])

      // 建立者一定在群組中
      const allMemberIds = Array.from(new Set([req.user.id, ...memberIds]))
      for (const uid of allMemberIds) {
        await db.run(
          `INSERT INTO chat_members (chat_id, user_id, role, last_read_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [chatId, uid, uid === req.user.id ? "owner" : "member"]
        )
      }

      res.status(201).json({ id: chatId })
    } catch (err) {
      res.status(500).json({ error: "建立群組失敗", detail: err.message })
    }
  })

  // 取得我的聊天室清單（含未讀數）
  router.get("/", requireAuth(jwtSecret), async (req, res) => {
    try {
      const me = req.user.id
      const chats = await db.all(`
        SELECT c.id, c.is_group, c.title, c.club_username AS clubUsername,
               c.company_username AS companyUsername, c.post_id AS postId,
               c.created_at AS createdAt,
               -- 最新訊息時間與最後一則訊息摘要
               (SELECT MAX(created_at) FROM messages WHERE chat_id = c.id) AS lastMsgAt,
               (SELECT body FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) AS lastMsg,
               -- 未讀數：我最後讀取以後的訊息數
               (
                 SELECT COUNT(*)
                 FROM messages msg
                 JOIN chat_members meM ON meM.chat_id = msg.chat_id AND meM.user_id = ?
                 WHERE msg.chat_id = c.id AND (meM.last_read_at IS NULL OR msg.created_at > meM.last_read_at)
               ) AS unread
        FROM chats c
        JOIN chat_members m ON m.chat_id = c.id
        WHERE m.user_id = ?
        ORDER BY COALESCE(lastMsgAt, c.created_at) DESC
      `, [me, me])

      res.json(chats)
    } catch (err) {
      res.status(500).json({ error: "取得聊天室清單失敗", detail: err.message })
    }
  })

  // 取得聊天室成員
  router.get("/:chatId/members", requireAuth(jwtSecret), async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT u.id, u.username, u.name, u.avatar, m.role, m.last_read_at AS lastReadAt
        FROM chat_members m
        JOIN users u ON u.id = m.user_id
        WHERE m.chat_id = ?
        ORDER BY u.name COLLATE NOCASE
      `, [req.params.chatId])
      res.json(rows)
    } catch (err) {
      res.status(500).json({ error: "取得成員失敗", detail: err.message })
    }
  })

  // 取得聊天室訊息（支援 since 及 limit）
    router.get("/:chatId/messages", requireAuth(jwtSecret), async (req, res) => {
    try {
        const { chatId } = req.params
        const limit = Math.min(Number(req.query.limit) || 50, 100)

        // 確認成員
        const member = await db.get(
        `SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?`,
        [chatId, req.user.id]
        )
        if (!member) return res.status(403).json({ error: "非聊天室成員" })

        // 簡單版：直接最新 -> 最舊
        const rows = await db.all(
        `
        SELECT m.id, m.body,
                strftime('%Y-%m-%dT%H:%M:%fZ', m.created_at) AS createdAt,
                u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.chat_id = ?
        ORDER BY m.created_at ASC
        LIMIT ?
        `,
        [chatId, limit]
        )

        res.json(rows)
    } catch (e) {
        res.status(500).json({ error: "無法取得訊息", detail: e.message })
    }
    })

  // 發送訊息
router.post("/:chatId/messages", requireAuth(jwtSecret), express.json(), async (req, res) => {
  try {
    const { chatId } = req.params
    const { body } = req.body || {}
    if (!body?.trim()) return res.status(400).json({ error: "內容不可為空" })

    const member = await db.get(
      `SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?`,
      [chatId, req.user.id]
    )
    if (!member) return res.status(403).json({ error: "非聊天室成員" })

    const id = crypto.randomUUID()
    await db.run(
      `INSERT INTO messages (id, chat_id, user_id, body) VALUES (?, ?, ?, ?)`,
      [id, chatId, req.user.id, body.trim()]
    )

    const msg = await db.get(
      `
      SELECT m.id, m.body,
             strftime('%Y-%m-%dT%H:%M:%fZ', m.created_at) AS createdAt,
             u.username AS authorUsername, u.name AS authorName, u.avatar AS authorAvatar
      FROM messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = ?
      `,
      [id]
    )

    // 若有推播（SSE/WS），在這裡「只 broadcast 一次」即可
    // io?.to(`chat:${chatId}`).emit("message:new", msg)
    // sseHub.broadcast(chatId, msg)

    res.status(201).json(msg)   // ✅ 只回傳新訊息
  } catch (e) {
    res.status(500).json({ error: "送出訊息失敗", detail: e.message })
  }
})


  router.post("/open-org", requireAuth(jwtSecret), express.json(), async (req, res) => {
    try {
      const { orgType, orgUsername } = req.body || {}
      if (!["club", "company"].includes(orgType) || !orgUsername) {
        return res.status(400).json({ error: "缺少 orgType 或 orgUsername" })
      }

      // 取得或建立官方群組
      const chatId = await getOrCreateOrgOfficialChat(db, { orgType, orgUsername })

      // 確保目前使用者在聊天室裡
      const exists = await db.get(
        `SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?`,
        [chatId, req.user.id]
      )
      if (!exists) {
        await db.run(
          `INSERT INTO chat_members (chat_id, user_id, role, last_read_at)
           VALUES (?, ?, 'member', CURRENT_TIMESTAMP)`,
          [chatId, req.user.id]
        )
      }

      res.json({ id: chatId })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "開啟聊天室失敗" })
    }
  })
  return router
}
