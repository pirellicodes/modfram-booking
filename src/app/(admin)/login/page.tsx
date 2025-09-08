import EnvCheck from "./_env-check";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <EnvCheck /> {/* <- add this */}
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
