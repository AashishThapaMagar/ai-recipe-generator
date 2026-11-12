import { useState, type FormEvent } from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'
import outputs from '../amplify_outputs.json'
import '@aws-amplify/ui-react/styles.css'
import './App.css'

Amplify.configure(outputs)
const client = generateClient<Schema>({ authMode: 'userPool' })

export default function App() {
  const [ingredients, setIngredients] = useState('')
  const [recipe, setRecipe] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRecipe('')
    setError('')

    const items = ingredients.split(',').map(item => item.trim()).filter(Boolean)
    if (!items.length) {
      setError('Enter at least one ingredient.')
      return
    }

    setLoading(true)
    try {
      const { data, errors } = await client.queries.askBedrock({ ingredients: items })
      if (errors?.length) throw new Error(errors[0].message)
      if (data?.error) throw new Error(data.error)
      if (!data?.body) throw new Error('Bedrock did not return a recipe.')
      setRecipe(data.body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a recipe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Recipe AI</h1>
      <p>Created by <strong>Aashish Thapa Magar</strong></p>
      <Authenticator>
        {({ signOut }) => (
          <>
            <form onSubmit={handleSubmit}>
              <label htmlFor="ingredients">Ingredients, separated by commas</label>
              <br />
              <textarea
                id="ingredients"
                rows={3}
                value={ingredients}
                onChange={event => setIngredients(event.target.value)}
                placeholder="rice, eggs, garlic, green onions"
              />
              <br />
              <button type="submit" disabled={loading}>
                {loading ? 'Generating…' : 'Generate recipe'}
              </button>
            </form>
            {error && <p role="alert">{error}</p>}
            {recipe && (
              <section aria-live="polite">
                <h2>Your recipe</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{recipe}</p>
              </section>
            )}
            <button type="button" onClick={() => signOut?.()}>Sign out</button>
          </>
        )}
      </Authenticator>
    </main>
  )
}