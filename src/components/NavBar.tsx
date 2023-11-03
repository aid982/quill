import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import LoginBtn from "./login-btn";
import { auth } from "@/lib/auth";

type Props = {};

async function NavBar({}: Props) {
  const session = await auth();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>Quill</span>
          </Link>

          {/* Mobile navbar */}
          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href={"/pricing"}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Pricing
              </Link>
              <LoginBtn session={session}></LoginBtn>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}

export default NavBar;
