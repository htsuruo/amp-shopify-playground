import { createStorefrontApiClient } from '@shopify/storefront-api-client'

const client = createStorefrontApiClient({
  storeDomain: 'http://02ebb2-4d-2.myshopify.com',
  apiVersion: '2024-10',
  publicAccessToken: 'dbec8572019cfa3572efd7872268f583',
})

const executeGraphQLRequest = async (
  operation: string,
  variables?: Record<string, any>
) => {
  try {
    const { data, errors } = await client.request(operation, { variables })
    if (errors) {
      console.error('Errors:', errors)
      throw new Error('Internal Server Error')
    }
    return data
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Internal Server Error')
  }
}

export default executeGraphQLRequest
