<script setup lang="ts">
import { z } from 'zod'

const emit = defineEmits(['saved'])

const isOpen = defineModel<boolean>('isOpen', {
  set(value) {
    if (!value) resetForm()
    else return value
  },
})

const formDefaultSchema = z.object({
  amount: z.number().positive('Amount needs to be more than 0'),
  created_at: z.string(),
  description: z.string().optional(),
})

const incomeSchema = z.object({
  type: z.literal('Income'),
})

const expenseSchema = z.object({
  type: z.literal('Expense'),
  category: z.enum(['Food', 'Housing', 'Car', 'Entertainment', 'Transport']),
})

const savingSchema = z.object({
  type: z.literal('Saving'),
})

const investmentSchema = z.object({
  type: z.literal('Investment'),
})

const formSchema = z.intersection(z.discriminatedUnion('type', [incomeSchema, expenseSchema, savingSchema, investmentSchema]), formDefaultSchema)

const form = ref()
const isLoading = ref(false)
const supabase = useSupabaseClient()
const toast = useToast()

async function save() {
  if (form.value.errors.length) return

  isLoading.value = true
  try {
    const { error } = await supabase.from('transactions').upsert({ ...formState.value })

    if (!error) {
      toast.add({
        title: 'Transaction Saved',
        icon: 'i-heroicons-check-circle',
      })
      isOpen.value = false
      emit('saved')
    }
  } catch (error: any) {
    toast.add({
      title: 'Transaction not saved',
      description: error.message,
      icon: 'i-heroicons-exclamation-circle',
    })
  } finally {
    isLoading.value = false
  }

  // Store into Supabase
}

const initialState = {
  type: undefined,
  amount: 0,
  created_at: undefined,
  description: undefined,
  category: undefined,
}
const formState = ref({
  ...initialState,
})

function resetForm(): void {
  Object.assign(formState.value, initialState)
  form.value.clear()
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>Add Transaction</template>

      <UForm ref="form" :state="formState" :schema="formSchema" class="flex flex-col gap-4" @submit="save">
        <UFormGroup label="Transaction Type" :required="true" name="type">
          <USelect v-model="formState.type" type="number" placeholder="Select the transaction Type" :options="CONST.TRANSACTION_TYPES" />
        </UFormGroup>

        <UFormGroup label="Amount" :required="true" name="amount">
          <UInput v-model.number="formState.amount" type="number" placeholder="Amount" />
        </UFormGroup>

        <UFormGroup label="Transaction Date" :required="true" name="created_at">
          <UInput v-model="formState.created_at" type="date" icon="i-heroicons-calendar-day-20-solid" />
        </UFormGroup>

        <UFormGroup label="Description" :required="false" hint="Optional" name="description">
          <UInput v-model="formState.description" placeholder="Description" />
        </UFormGroup>

        <UFormGroup v-if="formState.type === 'Expense'" label="Category" :required="true" name="category">
          <USelect v-model="formState.category" placeholder="Category" :options="CONST.EXPENSE_CATEGORIES" />
        </UFormGroup>

        <UButton type="submit" color="black" variant="solid" label="Save" :loading="isLoading" />
      </UForm>
    </UCard>
  </UModal>
</template>
