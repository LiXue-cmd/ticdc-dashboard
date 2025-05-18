<template>
  <Bouncer :ability="canEditPost" :args="[post]">
    <template #can>
      <button @click="handleEdit">编辑文章</button>
    </template>
    <template #cannot v-if="isAuthenticated">
      <p>你无权限编辑此文章</p>
    </template>
  </Bouncer>
</template>

<script setup lang="ts">
import { canEditPost } from '~~/shared/utils/abilities';
import { useUserSession } from '~/composables/useUserSession'; // 自定义 hooks 获取用户

interface Post {
  id: string | number;
  title: string;
  content: string;
  authorId: string | number; // 作者 ID，与 User 类型关联
  createdAt?: string | Date;
  updatedAt?: string | Date;
  status?: 'draft' | 'published' | 'archived';
}

const props = defineProps<{ post: Post }>();
const { user } = useUserSession(); // 获取当前用户
const isAuthenticated = ref(!!user.value);
</script>