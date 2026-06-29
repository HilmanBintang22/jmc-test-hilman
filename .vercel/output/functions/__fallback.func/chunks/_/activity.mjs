import { p as pool } from './db.mjs';
import { g as getClientInfo } from './helpers.mjs';

async function logActivity(event, title, content, userId = null) {
  try {
    const { ua, ip } = getClientInfo(event);
    const browser = ua.split(" ").slice(0, 3).join(" ") || ua;
    const platform = ua.includes("Windows") ? "Windows" : ua.includes("Linux") ? "Linux" : "Unknown";
    await pool.execute(
      `INSERT INTO activities (title, content, ua, ip, url, browser, platform, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
      [title, content, ua, ip, event.path, browser, platform, userId, userId]
    );
  } catch (err) {
    console.error("Activity log error:", err);
  }
}

export { logActivity as l };
//# sourceMappingURL=activity.mjs.map
