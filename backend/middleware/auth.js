// middleware/auth.js
import jwt from "jsonwebtoken";

export function signToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: "2h" });
}

export function requireAuth(secret) {
  return (req, res, next) => {
    try {
      const token = req.cookies.token   // ⭐ 從 cookie 拿
      if (!token) return res.status(401).json({ error: "未登入" })
      const payload = jwt.verify(token, secret)
      req.user = payload
      next()
    } catch (err) {
      return res.status(401).json({ error: "token 無效" })
    }
  }
}