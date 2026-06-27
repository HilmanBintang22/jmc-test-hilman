export function useAuth() {
  const { get, post, getToken } = useApi()
  const user = useState<any>("auth-user", () => null)
  const isLoggedIn = useState<boolean>("auth-logged-in", () => false)

  async function checkAuth() {
    const token = getToken()
    if (!token) {
      user.value = null
      isLoggedIn.value = false
      return false
    }

    try {
      const res = await get<any>("/auth/verify")
      user.value = res.data
      isLoggedIn.value = true
      return true
    } catch {
      user.value = null
      isLoggedIn.value = false
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      return false
    }
  }

  async function login(username: string, password: string, remember: boolean = false) {
    const res = await post<any>("/auth/login", { username, password })

    if (remember) {
      localStorage.setItem("token", res.token)
    } else {
      sessionStorage.setItem("token", res.token)
    }

    user.value = res.user
    isLoggedIn.value = true
    return res
  }

  async function logout() {
    try {
      await post("/auth/logout")
    } catch {
      // ignore
    }
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    user.value = null
    isLoggedIn.value = false
  }

  return {
    user,
    isLoggedIn,
    checkAuth,
    login,
    logout,
    getToken,
  }
}
