<script setup lang="ts">
const success = ref(false)
const email = ref('')
const pending = ref(false)
const { toastError } = useAppToast()
const supabase = useSupabaseClient<Database>()
const redirectUrl = useRuntimeConfig().public.baseUrl

useRedirectIfAuthenticated()

async function handleLogin(): Promise<void> {
  pending.value = true
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: { emailRedirectTo: `${redirectUrl}/confirm` },
    })
    if (error) {
      toastError({
        title: 'Error authenticating',
        description: error.message,
      })
      throw error
    } else {
      success.value = true
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UCard v-if="!success">
    <template #header> Sign-in to Finance Tracker </template>

    <form @submit.prevent="handleLogin">
      <UFormGroup label="Email" name="email" class="mb-4" :required="true" help="You will receive and email with the confirmation link">
        <UInput v-model="email" type="email" placeholder="Email" required />
      </UFormGroup>

      <UButton type="submit" variant="solid" color="black" :loading="pending" :disable="pending">Sign-in</UButton>
    </form>
  </UCard>

  <UCard v-else>
    <template #header> Email has been sent </template>

    <div class="text-center">
      <p class="mb-4">
        We have sent an email to <strong>{{ email }}</strong> with a link to sign-in.
      </p>
      <p><strong>Important:</strong> The link will expire in 5 minutes</p>
    </div>
  </UCard>
</template>
