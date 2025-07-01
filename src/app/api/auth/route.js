import { createClientForServer } from "@/utils/supabase/server";

export const GET = async (req) => {
  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
