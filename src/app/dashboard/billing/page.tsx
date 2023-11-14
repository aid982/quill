import Billingform from "@/components/Billingform";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import React from "react";

type Props = {};

async function page({}: Props) {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Billingform subscriptionPlan={subscriptionPlan}/>;
}

export default page;
