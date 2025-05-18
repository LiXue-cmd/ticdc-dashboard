// server/api/posts/[id]/edit.ts
import { defineEventHandler, getRouterParam } from 'nitro';
import { authorize } from 'nuxt-authorization';
import { canEditPost } from '~~/shared/utils/abilities';

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id');
  const post = await db.query<Post>().where('id', postId).first();
  
  // 校验权限：用户必须是文章作者
  await authorize(event, canEditPost, post); // 若失败则抛出 H3Error
  
  // 执行编辑逻辑...
  return updatePost(postId, await readBody(event));
});