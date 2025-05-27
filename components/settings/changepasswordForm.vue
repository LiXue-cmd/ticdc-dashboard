<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { h } from 'vue'
import * as z from 'zod'
import { toast } from '~/components/ui/toast'

const passwordFormSchema = toTypedSchema(z.object({
  currentPassword: z.string().min(8, {
    message: '密码长度至少为8个字符',
  }),
  newPassword: z
    .string()
    .min(8, {
      message: '新密码长度至少为8个字符',
    })
    .refine((value) => {
      // 密码必须包含大小写字母和数字
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
      return regex.test(value)
    }, {
      message: '新密码必须包含至少一个大写字母、一个小写字母和一个数字',
    }),
  confirmPassword: z.string().min(8, {
    message: '确认密码长度至少为8个字符',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
}))

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: passwordFormSchema,
})

const onSubmit = handleSubmit((values) => {
  // 这里处理密码修改逻辑
  console.log('提交的密码修改值:', values)
  
  toast({
    title: '密码修改成功',
    description: '您的密码已成功更新。',
    variant: 'success',
  })
  
  // 重置表单
  resetForm()
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      修改密码
    </h3>
    <p class="text-sm text-muted-foreground">
      请输入当前密码和新密码来修改您的账户密码。
    </p>
  </div>
  <Separator />
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="currentPassword">
      <FormItem>
        <FormLabel>当前密码</FormLabel>
        <FormControl>
          <Input type="password" placeholder="请输入当前密码" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          输入您当前的账户密码。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="newPassword">
      <FormItem>
        <FormLabel>新密码</FormLabel>
        <FormControl>
          <Input type="password" placeholder="请输入新密码" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          新密码必须至少包含8个字符，并包含大小写字母和数字。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="confirmPassword">
      <FormItem>
        <FormLabel>确认新密码</FormLabel>
        <FormControl>
          <Input type="password" placeholder="请再次输入新密码" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          再次输入新密码以确认。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    
    <div class="flex justify-start gap-2">
      <Button type="submit">
        修改密码
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