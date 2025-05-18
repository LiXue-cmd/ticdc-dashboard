// shared/utils/abilities/base.ts
import type { User } from '#types/user';
import type { Post } from '#types/post'; // 假设存在文章类型

// 允许游客访问的权限
export const canListPosts = defineAbility({ allowGuest: true }, (user: User | null) => true);

// 仅作者可编辑文章
export const canEditPost = defineAbility((user: User, post: Post) => {
  return user.id === post.authorId 
    ? allow() // 允许访问
    : deny('无权限编辑此文章', 403); // 拒绝并自定义错误信息
});

// 管理员可删除文章（假设用户角色通过 `role` 字段标识）
export const canDeletePost = defineAbility((user: User) => {
  return user.role === 'admin' 
    ? allow() 
    : deny('仅管理员可删除', 403);
});