import { authResponseSchema, getMeResponseSchema } from './schema'
import type { LoginInput, RegisterInput } from './schema'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const TOKEN_KEY = 'auth_token'

// Helper functions for token management
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// API functions
export async function login(data: LoginInput) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Login failed')
  }

  const result = authResponseSchema.parse(await response.json())
  setAuthToken(result.token)
  return result
}

export async function register(data: RegisterInput) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }

  const result = authResponseSchema.parse(await response.json())
  setAuthToken(result.token)
  return result
}

export async function getMe() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No auth token found')
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    removeAuthToken()
    throw new Error('Failed to get user')
  }

  return getMeResponseSchema.parse(await response.json())
}

export function logout() {
  removeAuthToken()
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to send reset email')
  }

  return response.json()
}

export async function resetPassword(token: string, password: string) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to reset password')
  }

  return response.json()
}
