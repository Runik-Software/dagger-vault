import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>{children}</SignedIn>
    </>
  );
}
