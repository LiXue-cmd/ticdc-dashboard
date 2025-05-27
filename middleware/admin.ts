export default defineNuxtRouteMiddleware((to) => {
  const { data: session } = useAuth()
  
  if (!session.value || session.value.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin role required.'
    })
  }
})