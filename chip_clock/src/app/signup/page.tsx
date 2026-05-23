"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/manage/labour" />
    </div>
  );
}
