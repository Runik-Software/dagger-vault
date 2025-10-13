import { SignedOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorisedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don’t have permission to view this page. You may need to sign in
            or return to a permitted area of the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-sm text-muted-foreground">
            If you believe this is an error, try signing in with the account
            that has access, or contact the campaign owner for an invite.
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 w-full">
            <SignedOut>
              <Link href="/auth/sign-in" className="w-full">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                Go Home
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
