import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    try {
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .where(eq(users.id, session.metadata.userId));
    } catch (error) {
      console.log(error);
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    try {
      await db
        .update(users)
        .set({
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .where(eq(users.stripeSubscriptionId, subscription.id));
    } catch (error) {
      console.log(error);
    }
  }

  return new Response(null, { status: 200 });
}
