'use client';

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormStatus } from "react-dom";

export default function SignInButton() {
  const {pending} = useFormStatus();

  return (
    <Button>
      {pending ? <><Spinner/> Signing In</>: 'Sign In'}
    </Button>
  )
}