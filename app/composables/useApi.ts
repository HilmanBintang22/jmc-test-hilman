const BASE_URL = "/api"

export function useApi() {
  const config = useRuntimeConfig()

  function getToken(): string | null {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }

  async function request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ success: boolean; message?: string; data?: T; pagination?: any }> {
    const token = getToken()
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const contentType = res.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || `Error ${res.status}`)
      }
      return json
    }

    if (contentType.includes("application/pdf") || contentType.includes("application/vnd.openxmlformats")) {
      const blob = await res.blob()
      const disposition = res.headers.get("content-disposition") || ""
      const filename = disposition.split("filename=")[1]?.replace(/"/g, "") || "download"
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      return { success: true }
    }

    if (!res.ok) {
      throw new Error(`Error ${res.status}`)
    }

    return { success: true }
  }

  return {
    getToken,
    get<T = any>(endpoint: string) {
      return request<T>(endpoint, { method: "GET" })
    },
    post<T = any>(endpoint: string, body?: any) {
      return request<T>(endpoint, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
      })
    },
    put<T = any>(endpoint: string, body?: any) {
      return request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      })
    },
    delete<T = any>(endpoint: string) {
      return request<T>(endpoint, { method: "DELETE" })
    },
  }
}
