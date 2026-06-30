/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const router = Router()

// 模拟用户数据库（实际应用中应该使用真实数据库）
interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  avatar?: string
  role?: string
  createdAt: Date
}

const users: User[] = []

// JWT 密钥（实际应用中应该使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Hash password using SHA-256
 */
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Generate JWT token
 */
const generateToken = (user: User): string => {
  return jwt.sign(
   { 
     userId: user.id, 
     email: user.email,
     username: user.username 
   },
   JWT_SECRET,
   { expiresIn: '7d' }
  )
}

/**
 * Verify JWT token middleware
 */
const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader= req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ error: '未提供认证令牌' })
  }

  const token = authHeader.substring(7)
  
 try {
  const decoded = jwt.verify(token, JWT_SECRET)
   ;(req as any).user = decoded
   next()
  } catch (error) {
  return res.status(401).json({ error: '无效的认证令牌' })
  }
}

/**
 * User Register
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
 try {
  const { username, email, password } = req.body

   // 验证必填字段
  if (!username || !email || !password) {
    res.status(400).json({ error: '用户名、邮箱和密码为必填项' })
    return
   }

   // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: '邮箱格式不正确' })
    return
   }

   // 验证密码强度
  if (password.length < 8) {
    res.status(400).json({ error: '密码长度至少为 8 位' })
    return
   }

   // 检查邮箱是否已存在
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    res.status(409).json({ error: '该邮箱已被注册' })
    return
   }

   // 创建新用户
  const newUser: User = {
     id: crypto.randomUUID(),
     username,
     email,
    passwordHash: hashPassword(password),
     avatar: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(username)}`,
     role: 'user',
     createdAt: new Date()
   }

   users.push(newUser)

  console.log('User registered:', { id: newUser.id, email: newUser.email })

   // 返回成功响应（不包含密码）
  res.status(201).json({
    message: '注册成功',
     user: {
       id: newUser.id,
       username: newUser.username,
       email: newUser.email,
       avatar: newUser.avatar
     }
   })
  } catch (error) {
  console.error('Register error:', error)
  res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
 try {
  const { email, password } = req.body

   // 验证必填字段
  if (!email || !password) {
    res.status(400).json({ error: '邮箱和密码为必填项' })
    return
   }

   // 查找用户
  const user = users.find(u => u.email === email)

  if (!user) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
   }

   // 验证密码
  const passwordHash = hashPassword(password)
  if (user.passwordHash !== passwordHash) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
   }

   // 生成 JWT token
  const token = generateToken(user)

  console.log('User logged in:', { id: user.id, email: user.email })

   // 返回成功响应
  res.json({
    message: '登录成功',
     token,
     user: {
       id: user.id,
       username: user.username,
       email: user.email,
       avatar: user.avatar
     }
   })
  } catch (error) {
  console.error('Login error:', error)
  res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', verifyToken, async (req: Request, res: Response): Promise<void> => {
 try {
  const user= (req as any).user
  console.log('User logged out:', user)
   
   // 在实际应用中，这里可以将 token 加入黑名单
  res.json({ message: '登出成功' })
  } catch (error) {
  console.error('Logout error:', error)
  res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
})

/**
 * Get Current User Info
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req: Request, res: Response): Promise<void> => {
 try {
  const userPayload = (req as any).user
   
   // 从数据库中查找用户
  const user = users.find(u => u.email === userPayload.email)
   
  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
   }

  res.json({
     user: {
       id: user.id,
       username: user.username,
       email: user.email,
       avatar: user.avatar,
       role: user.role,
       createdAt: user.createdAt
     }
   })
  } catch (error) {
  console.error('Get user info error:', error)
  res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
})

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
router.post('/refresh', verifyToken, async (req: Request, res: Response): Promise<void> => {
 try {
  const userPayload = (req as any).user
   
   // 从数据库中查找用户
  const user = users.find(u => u.email === userPayload.email)
   
  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
   }

   // 生成新的 token
  const newToken = generateToken(user)

  res.json({
    message: 'Token 刷新成功',
     token: newToken
   })
  } catch (error) {
  console.error('Refresh token error:', error)
  res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
})

export default router
