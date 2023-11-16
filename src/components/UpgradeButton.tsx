"use client"
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import { absoluteURL } from "@/lib/utils";

const UpgradeButton = ()=>{
    const {mutate:createStripeSession} = trpc.createStripeSession.useMutation({
        onSuccess:({url})=>{
            console.log(url)
            window.location.href =absoluteURL("/dashboard/billing");




        }

    });
    return(<Button className="w-full" onClick={()=>{ 
        console.log('ee')
        createStripeSession()
    }}>Upgrade now<ArrowRight className="h-5 w-5 ml-1.5"/></Button>)

}
export default UpgradeButton;