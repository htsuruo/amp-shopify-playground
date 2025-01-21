import { createStorefrontApiClient } from '@shopify/storefront-api-client'

const client = createStorefrontApiClient({
  storeDomain: 'http://02ebb2-4d-2.myshopify.com',
  apiVersion: '2024-10',
  publicAccessToken: process.env.SHOPIFY_PUBLIC_ACCESS_TOKEN,
})

const executeGraphQLRequest = async (
  operation: string,
  variables?: Record<string, any>
) => {
  try {
    const { data, errors } = await client.request(operation, { variables })
    console.log('Data:', data)
    if (errors) {
      console.error('Errors:', errors)
      throw new Error('Internal Server Error')
    }
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Internal Server Error')
  }
}

export default executeGraphQLRequest
