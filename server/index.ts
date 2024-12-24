import { serve } from '@hono/node-server'
import app from './app'

export default serve(app, () => {
  console.log('Server is running on http://localhost:3000')
})
