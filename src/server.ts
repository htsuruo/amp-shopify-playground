import { serve } from '@hono/node-server'
import axios from 'axios'
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

    const response = await axios.post(
      'https://02ebb2-4d-2.myshopify.com/cart/add.js',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = response.data

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

export default serve(app, () => {
  console.log('Server is running on http://localhost:3000')
})
