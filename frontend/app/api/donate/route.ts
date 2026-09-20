import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Donations are not configured" }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" })

  const { amount, email } = await req.json()

  if (!amount || amount < 100) {
    return NextResponse.json({ error: "Minimum donation is PKR 100" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "pkr",
          product_data: {
            name: "LinguaSign Donation",
            description: "Supporting Pakistan Sign Language education & accessibility",
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: email ?? undefined,
    success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/donate/thank-you?amount=${amount}`,
    cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/donate`,
  })

  return NextResponse.json({ url: session.url })
}
