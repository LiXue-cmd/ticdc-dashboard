<script setup lang="ts">
import { cn } from '@/lib/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray, useForm } from 'vee-validate'
import { h, ref } from 'vue'
import * as z from 'zod'
import { toast } from '~/components/ui/toast'

const verifiedEmails = ref(['m@example.com', 'm@google.com', 'm@support.com'])

// 定义中国手机号验证正则表达式
const chineseMobileRegex = /^1[3-9]\d{9}$/

const profileFormSchema = toTypedSchema(z.object({
  username: z
    .string()
    .min(2, {
      message: '用户名至少需要2个字符',
    })
    .max(30, {
      message: '用户名最多不超过30个字符',
    }),
  email: z
    .string({
      required_error: '请选择一个要显示的邮箱',
    })
    .email(),
  bio: z.string().max(160, { message: '个人简介最多不超过160个字符' }).min(4, { message: '个人简介至少需要4个字符' }),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: '请输入有效的URL' }),
      }),
    )
    .optional(),
  // 新增：姓名
  fullName: z
    .string()
    .min(2, {
      message: '姓名至少需要2个字符',
    })
    .max(20, {
      message: '姓名最多不超过20个字符',
    }),
  // 新增：手机号
  phone: z
    .string()
    .refine((value) => chineseMobileRegex.test(value), {
      message: '请输入有效的中国手机号',
    }),
  // 新增：联系地址
  address: z
    .string()
    .min(5, {
      message: '联系地址至少需要5个字符',
    })
    .max(100, {
      message: '联系地址最多不超过100个字符',
    }),
}))

const { handleSubmit, resetForm } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    username: 'example_user',
    email: 'm@example.com',
    bio: 'I own a computer.',
    urls: [
      { value: 'https://shadcn.com' },
      { value: 'http://twitter.com/shadcn' },
    ],
    // 新增字段的初始值
    fullName: '张三',
    phone: '13800138000',
    address: '北京市朝阳区科技园',
  },
})

const onSubmit = handleSubmit((values) => {
  toast({
    title: '您已成功更新个人资料',
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      个人资料
    </h3>
    <p class="text-sm text-muted-foreground">
      这里是您的个人资料信息。您可以在此处更新您的用户名、电子邮件地址和个人简介等信息。
    </p>
  </div>
  <Separator />
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>账户名</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入账户名" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          这里是您的账户名。它将显示在您的个人资料页面上。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>邮箱</FormLabel>

        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="选择一个邮箱" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="email in verifiedEmails" :key="email" :value="email">
                {{ email }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>
          请选择一个邮箱地址。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="bio">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl>
          <Textarea placeholder="Tell us a little bit about yourself" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          这里是您的个人简介。它将显示在您的个人资料页面上。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 新增：姓名 -->
    <FormField v-slot="{ componentField }" name="fullName">
      <FormItem>
        <FormLabel>姓名</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入您的姓名" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          这里是您的真实姓名。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 新增：手机号 -->
    <FormField v-slot="{ componentField }" name="phone">
      <FormItem>
        <FormLabel>手机号</FormLabel>
        <FormControl>
          <Input type="tel" placeholder="请输入您的手机号" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          请输入有效的中国手机号，用于接收通知和验证。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 新增：联系地址 -->
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>联系地址</FormLabel>
        <FormControl>
          <Textarea placeholder="请输入您的联系地址" v-bind="componentField" rows="3" />
        </FormControl>
        <FormDescription>
          请输入您的详细联系地址，用于订单配送等服务。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start gap-2">
      <Button type="submit">
        更新个人资料
      </Button>

      <Button
        type="button"
        variant="outline"
        @click="resetForm"
      >
        重置表单
      </Button>
    </div>
  </form>
</template>  