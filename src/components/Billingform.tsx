"use client";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import React from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Props = {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

function Billingform({ subscriptionPlan }: Props) {
  const { toast } = useToast();
  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) window.location.href = url;
        if (!url) {
          toast({
            title: "Something went wrong",
            description: "Try again letter",
            variant: "destructive",
          });
        }
      },
    });
  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSession();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription plan</CardTitle>
            <CardDescription>
              You are currenly on the{" "}
              <strong>{subscriptionPlan.name} plan</strong>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col items-start space-x-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isLoading ? <Loader2 className="animate-spin w-4 mr-4" /> : null}
              {subscriptionPlan.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to Pro"}
            </Button>
            {subscriptionPlan.isSubscribed ? (<p className="rounded-full text-sx font-medium">
                {
                    subscriptionPlan.isCanceled ? "Ypur plan wil be canceled on":"Your plan ends"

                }
                {format(subscriptionPlan.stripeCurrentPeriodEnd!,"dd.MM.yyyy")


                }

            </p>):null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
}

export default Billingform;
