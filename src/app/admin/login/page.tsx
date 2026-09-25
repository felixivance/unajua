import { AdminLoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  return <AdminLoginForm notAdminError={error === "not_admin"} />;
}
