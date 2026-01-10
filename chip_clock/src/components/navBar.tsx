import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./themeToggle";

export function NavigationBar() {
  // const isManager = await checkRole('manager');
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* {isManager && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/manage">Manage</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )} */}
        <SignedIn>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/manage">Management</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/login">Login</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </SignedOut>
        <NavigationMenuItem>
          <ThemeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
