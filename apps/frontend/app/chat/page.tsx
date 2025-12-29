import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { redirect } from "next/navigation";

export default async function Page(props: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await props.searchParams;

	const id = await fetchMutation(api.chat.createChat, {});

	redirect(q ? `/chat/${id}?q=${encodeURIComponent(q)}` : `/chat/${id}`);
}
