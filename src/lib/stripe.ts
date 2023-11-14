import { PLANS } from "@/config/stripe";
import Stripe from "stripe";
import { auth } from "./auth";
import { db } from "./db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {  
  apiVersion: '2023-08-16',
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const session = await auth();
  if (!session) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }
  
  const {user} = session;

  const dbUsers = await db.select().from(users).where(eq(users.id,user.id));
  if(dbUsers.length===0) return {
    ...PLANS[0],
    isSubscribed: false,
    isCanceled: false,
    stripeCurrentPeriodEnd: null,
  };;
  const dbUser = dbUsers[0];

  
  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
