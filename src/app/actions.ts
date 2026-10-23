"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentProfile, encodeProfile, PROFILE_COOKIE, sanitizeProfile, type Profile } from "@/lib/profile";
import type { Lang } from "@/lib/taxonomy";

async function writeProfile(p: Profile) {
  (await cookies()).set(PROFILE_COOKIE, encodeProfile(p), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 400, path: "/" });
}

export async function saveProfile(input: { exams: string[]; state: string | null; lang: Lang; examDate: string | null }) {
  const p = sanitizeProfile(input);
  if (!p) throw new Error("Pick at least one exam");
  const prev = await currentProfile();
  await writeProfile({ ...p, dailyGoal: prev?.dailyGoal ?? p.dailyGoal });
  redirect("/");
}

export async function setLang(lang: Lang) {
  const p = await currentProfile();
  if (!p) redirect("/welcome");
  await writeProfile({ ...p, lang });
  revalidatePath("/", "layout");
}
