import { useState, useEffect, useCallback } from 'react'

let globalLoggedIn = !!localStorage.getItem('token')
let globalListeners: Array<() => void> = []

function notifyListeners() {
  globalListeners.forEach((fn) => fn())
}

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(globalLoggedIn)
  const [loading] = useState(false)

  useEffect(() => {
    const listener = () => setLoggedIn(globalLoggedIn)
    globalListeners.push(listener)
    return () => {
      globalListeners = globalListeners.filter((fn) => fn !== listener)
    }
  }, [])

  const setToken = useCallback((token: string) => {
    localStorage.setItem('token', token)
    globalLoggedIn = true
    setLoggedIn(true)
    notifyListeners()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    globalLoggedIn = false
    setLoggedIn(false)
    notifyListeners()
  }, [])

  return {
    loggedIn,
    loading,
    setToken,
    logout,
    // 单租户没有 admin 概念
    user: loggedIn ? { role: 'owner' } : null,
    isAdmin: false,
  }
}
