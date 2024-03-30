import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkd2liY253dHdoZm5zbmJsZHRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODE4MTY3NiwiZXhwIjoyMDIzNzU3Njc2fQ.Q2hDloGQ3J7TdT90jN9PQY5Y3IpmDB_mHgCby0tmte8',
  {
    auth: { persistSession: false },
  }
)
const categories = ['Food', 'Housing', 'Car', 'Entertainment', 'Transport']

const {
  data: { users },
} = await supabase.auth.admin.listUsers()
const userIds = users.map(user => user.id)

async function seedTransactions() {
  // Delete existing data
  const { error: deleteError } = await supabase.from('transactions').delete().gte('id', 0)

  if (deleteError) {
    console.error('Error deleting existing data:', deleteError)
    return
  }

  let transactions = []

  for (const userId of userIds) {
    for (let year = new Date().getFullYear() + 1; year > new Date().getFullYear() - 2; year--) {
      for (let i = 0; i < 10; i++) {
        const date = new Date(year, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }))

        let type, category
        const typeBias = Math.random()

        if (typeBias < 0.85) {
          type = 'Expense'
          category = faker.helpers.arrayElement(categories) // Category only for 'Expense'
        } else if (typeBias < 0.95) {
          type = 'Income'
        } else {
          type = faker.helpers.arrayElement(['Saving', 'Investment'])
        }

        let amount
        switch (type) {
          case 'Income':
            amount = faker.number.int({ min: 2000, max: 5000 })
            break
          case 'Expense':
            amount = faker.number.int({ min: 100, max: 1000 })
            break
          case 'Saving':
          case 'Investment':
            amount = faker.number.int({ min: 5000, max: 10000 })
            break
          default:
            amount = 0
        }

        transactions.push({
          created_at: date,
          amount,
          type,
          description: faker.lorem.sentence(),
          category: type === 'Expense' ? category : null, // Category only for 'Expense'
          user_id: userId,
        })
      }
    }
  }

  const { error: insertError } = await supabase.from('transactions').upsert(transactions)

  if (insertError) {
    console.error('Error inserting data:', insertError)
  } else {
    console.log('Data inserted successfully.')
  }
}

seedTransactions().catch(console.error)
