import { defineNuxtRouteMiddleware } from "nuxt/app"

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login" || to.path.startsWith("/auth")) return

  const { getToken, setToken } = useApi()
  const { checkAuth } = useAuth()
  const token = getToken()
  if (!token) {
    return navigateTo("/login")
  }

  const authenticated = await checkAuth()
  if (!authenticated) {
    return navigateTo("/login")
  }
})  
