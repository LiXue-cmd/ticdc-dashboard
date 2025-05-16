<script setup lang="ts">
import { useSidebar } from "~/components/ui/sidebar";

const { $auth } = useNuxtApp();
const user = computed(() => $auth.user as User);

defineProps<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}>();

const { isMobile, setOpenMobile } = useSidebar();

// function handleLogout() {
//   navigateTo('/login')
// }
const handleLogout = async () => {
  await $auth.logout();
  navigateTo("/login");
};
const showModalTheme = ref(false);
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                {{
                  user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <Icon name="i-lucide-chevrons-up-down" class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="min-w-56 w-[--radix-dropdown-menu-trigger-width] rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{
                    user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Icon name="i-lucide-sparkles" />
              Upgrade to Pro
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Icon name="i-lucide-badge-check" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/settings" @click="setOpenMobile(false)">
                <Icon name="i-lucide-settings" />
                Settings
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="i-lucide-bell" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink
                to="https://github.com/dianprata/nuxt-shadcn-dashboard"
                external
                target="_blank"
              >
                <Icon name="i-lucide-github" />
                Github Repository
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem @click="showModalTheme = true">
              <Icon name="i-lucide-paintbrush" />
              Theme
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <!-- 只有管理员可以看到的内容 -->
          <Can ability="isAdmin">
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p class="font-bold">管理员功能</p>
              <p>您可以访问管理控制面板和用户管理功能。</p>
            </div>
          </Can>
          <!-- 只有拥有特定权限的用户可以看到的内容 -->
          <Can ability="hasPermission" :args="['view-dashboard']">
            <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <p class="font-bold">数据概览</p>
              <p>这里显示系统关键指标和统计数据。</p>
            </div>
          </Can>

          <DropdownMenuItem @click="handleLogout">
            <Icon name="i-lucide-log-out" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <Dialog v-model:open="showModalTheme">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Customize</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          Customize & Preview in Real Time
        </DialogDescription>
      </DialogHeader>
      <ThemeCustomize />
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
