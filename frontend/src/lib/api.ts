const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const api = {
  token: "",
  setToken(t: string) { this.token = t; },
  headers() { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },
  async get(path: string) {
    const res = await fetch(`${BASE}${path}`, { headers: this.headers() });
    return res.json();
  },
  async post(path: string, body: any, method: string = "POST") {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...this.headers() },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};
