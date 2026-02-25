import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./themeToggle";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-muted")}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <SignedIn>
          <NavigationMenuItem>
            <Link href="/manage" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-muted")}>
                Management
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <div className="flex items-center gap-2 pl-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

        <SignedOut>
          <NavigationMenuItem>
            <Link href="/login" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-muted")}>
                Login
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </SignedOut>

        <NavigationMenuItem className="pl-2">
          <ThemeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}