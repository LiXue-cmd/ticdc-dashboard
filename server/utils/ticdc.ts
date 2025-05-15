import { Buffer } from 'node:buffer'
import process from 'node:process'

export interface TiError {
  error_msg: string
  error_code: string
}

export interface TiStatus {
  version: string
  id: string
  pid: number
  is_owner: boolean
  liveness: number
}

export interface TiListResponse<T> {
  total: number
  items: T[]
}

export interface TiTask {
  id: string
  state: string
  checkpoint_tso: string
  checkpoint_time: string
  error?: string
}

export interface TiTaskConfig {
  [key: string]: any
}

export class TiCDC {
  private static BASE_URL = process.env.TIDB_CDC_URL

  constructor(private readonly username: string, private readonly password: string) { }

  async get<T>(url: string): Promise<T> {
    const response = await $fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
      },
    })
    return response as T
  }

  async post<T>(url: string, body: any): Promise<T> {
    const response = await $fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
      },
      body: JSON.stringify(body),
    })
    return response as T
  }

  /**
   * 获取 TiCDC 状态信息
   * GET /api/v2/status
   */
  async getStatus(): Promise<TiStatus | TiError> {
    const response: TiStatus | TiError = await this.get(`${TiCDC.BASE_URL}/api/v2/status`)
    return response
  }

  /**
   * 获取当前的任务列表
   * GET /api/v2/changefeeds
   */
  async listTasks(state: string): Promise<TiTask[]> {
    if (!state) {
      state = 'all'
    }
    const response: TiListResponse<TiTask> = await this.get(`${TiCDC.BASE_URL}/api/v2/changefeeds?state=${state}`)
    return response.items
  }

  async createTask(task: TiTaskConfig): Promise<TiTaskConfig> {
    try {
      return await this.post(`${TiCDC.BASE_URL}/api/v2/changefeeds`, task)
    }
    catch (error: any) {
      // console.log('create task error:', error.code, error.message, JSON.stringify(error.data), JSON.stringify(error))
      return error.data
    }
  }
}
