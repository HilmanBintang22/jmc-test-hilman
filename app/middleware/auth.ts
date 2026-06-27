export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login" || to.path.startsWith("/auth")) return

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    return navigateTo("/login")
  }

  try {
    const res = await $fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.success) {
      return navigateTo("/login")
    }
  } catch {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    return navigateTo("/login")
  }
})
