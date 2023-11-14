import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Button, } from "./ui/button";
import { Session } from "next-auth";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Icons } from "./Icons";
import { Gem } from "lucide-react";

export default async function UserAccountNav({
  session,
}: {
  session: Session | null;
}) {
  const subscriptionPlan = await getUserSubscriptionPlan();

  if (session) {
    const { user } = session;
    console.log(user.image);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="overflow-visible" asChild>
          <Button className="rounded-full h-8 w-8 aspect-square bg-slate-300">
            <Avatar className="relative w-8 h-8">
              {user.image ? (
                <div className="relative h-full w-full aspect-square">
                  <Image
                    fill={true}
                    src={user.image}
                    alt="Profile picture"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <AvatarFallback>
                  <span className="sr-only">{user.name}</span>
                  <Icons.user className="h-4 w-4 text-zinc-900" />
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white" align="end">
          <div className="flex items-center justify-center gap-2 p-2">
            <div>
              {user.name && (
                <p className="font-medium text-sm text-black">{user.name}</p>
              )}
              {user.email && (
                <p className="font-medium text-xs text-zinc-500 w-[200px]  truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={"/dashboard"}>Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            {subscriptionPlan?.isSubscribed ? (
              <Link href={"/dashboard/billing"}>Manage Subscription</Link>
            ) : (
              <Link href={"/pricing"}>
                Upgrade <Gem className="text-blue-600 h-4 w-4" />
              </Link>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/api/auth/signout">Sign out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <>
      <Link href="/api/auth/signin">Sign in</Link>
    </>
  );
}
