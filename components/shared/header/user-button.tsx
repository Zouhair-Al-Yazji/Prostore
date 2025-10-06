import { auth } from "@/auth"
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutUser } from "@/lib/actions/user.actions";
import { UserIcon } from "lucide-react";
import Link from "next/link";

export default async function UserButton() {
  const session = await auth();

  if(!session) return (
    <Button asChild>
      <Link href="/sign-in">
        <UserIcon /> Sign in
      </Link>
    </Button>
  )

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <div className="flex items-center">
            <Button variant={'ghost'} className='relative w-8 h-8 flex-center bg-gray-200 rounded-full'>{firstInitial}</Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-52' align="end" forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium leading-none'>{session.user?.name}</p>
              <p className='text-sm text-muted-foreground leading-none'>{session.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='p-0 mb-1'>
            <form action={SignOutUser} className='w-full'>
              <Button className='w-full px-2 justify-start py-4 h-4' variant={'ghost'}>Sign Out</Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
