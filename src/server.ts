import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORSミドルウェアの設定
app.use(
  '/*',
  cors({
    origin: 'https://mail.google.com',
    credentials: true,
  })
)

app.get('/', (c) => {
  return c.text('Hello World')
})

app.post('/proxy/cart/add', async (c) => {
  try {
    const body = await c.req.json()

    const shopifyResponse = await fetch(
      'https://02ebb2-4d-2.myshopify.com/cart/add.js',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await shopifyResponse.json()

    return c.json(data, {
      headers: {
        'AMP-Access-Control-Allow-Source-Origin': 'https://02ebb2-4d-2',
        'Access-Control-Expose-Headers':
          'AMP-Access-Control-Allow-Source-Origin',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

serve(app, () => {
  console.log('Server is running on http://localhost:3000')
})
