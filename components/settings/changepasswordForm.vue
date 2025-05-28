<script setup lang="ts">
import { cn } from '@/lib/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray, useForm } from 'vee-validate'
import { h, ref } from 'vue'
import * as z from 'zod'
import { toast } from '~/components/ui/toast'

const verifiedEmails = ref(['m@example.com', 'm@google.com', 'm@support.com'])

const profileFormSchema = toTypedSchema(z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).min(4, { message: 'Bio must be at least 2 characters.' }),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: 'Please enter a valid URL.' }),
      }),
    )
    .optional(),
}))

const { handleSubmit, resetForm } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    bio: 'I own a computer.',
    urls: [
      { value: 'https://shadcn.com' },
      { value: 'http://twitter.com/shadcn' },
    ],
  },
})

const onSubmit = handleSubmit((values) => {
  toast({
    title: 'You submitted the following values:',
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
