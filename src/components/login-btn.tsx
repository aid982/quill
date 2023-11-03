import { buttonVariants } from "./ui/button";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginBtn({ session }: { session: Session | null }) {
  if (session) {
    return (
      <>
        {session.user.email} <br />
        <Link
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
          href="/api/auth/signout"
        >
          Sign out
        </Link>
      </>
    );
  }
  return (
    <>
      <Link
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
        })}
        href="/api/auth/signin"
      >
        Sign in
      </Link>      
    </>
  );
}
