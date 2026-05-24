import { Webhook } from 'svix'

import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import prisma from '@/app/prisma'
import { EmployeeRole } from '@/generated/prisma/enums'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const svix_id = req.headers.get("svix-id")
  const svix_timestamp = req.headers.get("svix-timestamp")
  const svix_signature = req.headers.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : ''

    try {
      // 1. Create the user in Prisma
      await prisma.employee.create({
        data: {
          clerk_id: id,
          email: primaryEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          role: EmployeeRole.crew, // Default role
          status: 'active'
        }
      })

      // 2. Update the user metadata in Clerk to set the default role
      const client = await clerkClient()
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: EmployeeRole.crew
        }
      })

      console.log(`User ${id} created in DB and Clerk updated with default role crew`)
    } catch (err) {
      console.error('Error creating user in DB or updating Clerk:', err)
      return new Response('Error processing user.created', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
