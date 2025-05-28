<script setup lang="ts">
import { navMenu } from "~/constants/menus";

const route = useRoute();

function setLinks() {
  if (route.fullPath === "/") {
    return [{ title: "首页", href: "/" }];
  }
  const breadcrumbs = navMenu.reduce(
    (acc, group) => {
      group.items.forEach((item) => {
        if (item.link === route.fullPath) {
          acc.push({ title: item.title, href: item.link });
        }
      });
      return acc;
    },
    [] as { title: string; href: string }[]
  );

  if (breadcrumbs.length === 0) {
    navMenu.reduce((acc, group) => {
      group.items.forEach((item) => {
        const parts = route.fullPath.split("/");
        if (parts.length > 2) {
          const result = `/${parts[1]}`;
          let val = "";
          if (`${parts[2]}` === "create") {
            val = "新建";
          } else if (`${parts[2]}` === "edit") {
            val = "编辑";
          } else if (`${parts[2]}` === "detail") {
            val = "详情";
          } else {
            val = parts[1].replace(/-/g, " ");
          }
          if (item.link === result) {
            breadcrumbs.push({ title: item.title, href: route.fullPath });
            // breadcrumbs.push({ title: item.title +' > '+val, href: route.fullPath });
          }
        }
      });
    });
  }

  return [{ title: "首页", href: "/" }, ...breadcrumbs];
}

const links = ref<
  {
    title: string;
    href: string;
  }[]
>(setLinks());

watch(
  () => route.fullPath,
  (val) => {
    if (val) {
      links.value = setLinks();
    }
  }
);
</script>

<template>
  <header
    class="sticky top-0 z-10 h-53px flex items-center gap-4 border-b bg-background px-4 md:px-6"
  >
    <div class="w-full flex items-center gap-4">
      <SidebarTrigger />
      <Separator orientation="vertical" class="h-4" />
      <BaseBreadcrumbCustom :links="links" />
    </div>
    <div class="ml-auto">
      <slot />
    </div>
  </header>
</template>

<style scoped></style>
