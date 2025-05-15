import { TiCDC } from '~/server/utils/ticdc'

export default eventHandler(async (event) => {
  const { state } = getQuery(event)

  const tiCDC = new TiCDC('root', 'ylfMM@123')
  const tasks = await tiCDC.listTasks(state?.valueOf() as string)

  return tasks
})
