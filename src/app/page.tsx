"use client";

import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div
      className=" text-stone-800 font-serif"
      style={{ backgroundBlendMode: "multiply" }}
    >
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="relative mb-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-stone-900 drop-shadow-sm">
            Dagger Vault
          </h1>
          <p className="text-lg md:text-xl text-stone-700 max-w-2xl mx-auto">
            Manage your Daggerheart campaigns, track your characters’ hope,
            stress, and gold — and keep an eye on your GM’s growing fear.
          </p>
          <div className="mt-8">
            <SignedOut>
              <Link href="/auth/sign-in">
                <Button
                  size="lg"
                  className=" rounded-xl px-8 py-6 text-lg shadow-md"
                >
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/characters">
                <Button
                  size="lg"
                  className="rounded-xl px-8 py-6 text-lg shadow-md"
                >
                  View Characters
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mt-20 max-w-6xl">
          <Card className="bg-amber-50/80 border-amber-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-amber-900">
                Track Resources
              </h2>
              <p className="text-stone-700">
                Keep tabs on hope, stress, HP, gold, and more — all in one clean
                dashboard that feels like an extension of your paper sheet.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/80 border-amber-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-amber-900">
                Manage Campaigns
              </h2>
              <p className="text-stone-700">
                Create or join campaigns, invite your friends, and coordinate
                your adventures effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/80 border-amber-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-amber-900">
                GM Fear Tracker
              </h2>
              <p className="text-stone-700">
                Watch the GM’s fear rise as your heroes face the darkness — a
                shared tension made visible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
