import { g as getHeader } from './nitro.mjs';

function getClientInfo(event) {
  const ua = getHeader(event, "user-agent") || "";
  const ip = getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || event.node.req.socket.remoteAddress || "";
  return { ua, ip };
}
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export { getClientInfo as g, parsePagination as p };
//# sourceMappingURL=helpers.mjs.map
