import type { TiTaskConfig } from '~/server/utils/ticdc'
import { TiCDC } from '~/server/utils/ticdc'

export default eventHandler(async (event) => {
  const result = await readBody(event) as TiTaskConfig

  const tiCDC = new TiCDC('root', 'ylfMM@123')
  const res = await tiCDC.createTask(result)

  if (res.error_code) {
    throw createError({
      statusCode: 400,
      statusMessage: res.error_msg,
    })
  }

  return res
})
