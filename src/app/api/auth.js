import { createClientForServer } from "@/utils/supabase/server";

export default async function handler(req, res) {
  const supabase = createClientForServer();
  const { data, error } = await supabase.auth.getUser();
    console.log(1)
  if (error || !data?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.status(200).json({ user: data.user });
}
