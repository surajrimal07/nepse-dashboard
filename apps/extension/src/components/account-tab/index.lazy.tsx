import { Badge } from "@nepse-dashboard/ui/components/badge";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { createLazyRoute } from "@tanstack/react-router";
import { Edit2, Star, Trash2 } from "lucide-react";
import { lazy, useCallback, useMemo, useState } from "react";
import { EmptyAccounts } from "@/components/account-tab/empty-account";
import OptionsDialog from "@/components/account-tab/options";
import BackButton from "@/components/back-button/back-button";
import { handleActionResult } from "@/hooks/handle-action";
import type { accountType } from "@/types/account-types";
import { AccountType } from "@/types/account-types";
import { TAB_TRIGGER_STYLES } from "@/utils/tab-style";
import Loading from "../loading";

const AddAccountForm = lazy(() => import("@/components/account-tab/add-form"));
const EditAccountForm = lazy(
	() => import("@/components/account-tab/edit-form"),
);

export const Route = createLazyRoute("/account")({
	component: Account,
});

export default function Account() {
	const { useStateItem, callAction } = useAppState();

	const [editingAccount, setEditingAccount] = useStateItem("editingAccount");
	const [accounts] = useStateItem("accounts");

	const [activeTab, setActiveTab] = useState<accountType>(AccountType.TMS);
	const [isAddingAccount, setIsAddingAccount] = useState(false);
	const [isOptionOpen, setIsOptionOpen] = useState(false);

	const tmsAccounts = useMemo(
		() => accounts.filter((account) => account.type === AccountType.TMS),
		[accounts],
	);

	const meroAccounts = useMemo(
		() => accounts.filter((account) => account.type === AccountType.MEROSHARE),
		[accounts],
	);

	const naasaxAccounts = useMemo(
		() => accounts.filter((account) => account.type === AccountType.NAASAX),
		[accounts],
	);

	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value as accountType);
	}, []);

	const handleMakePrimary = useCallback(
		(alias: string) => async () => {
			callAction("makePrimary", alias).then(handleActionResult);
		},
		[callAction],
	);

	const handleDeleteAccount = useCallback(
		(alias: string) => async () => {
			callAction("deleteAccount", alias).then(handleActionResult);
		},
		[callAction],
	);

	const handleEditAccount = useCallback(
		(alias: string) => () => {
			setEditingAccount(alias);
		},
		[setEditingAccount],
	);

	return (
		<div className="p-1">
			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full"
			>
				<TabsList className="w-full mb-2 gap-1">
					<TabsTrigger value="tms" className={TAB_TRIGGER_STYLES}>
						TMS
					</TabsTrigger>
					<TabsTrigger value="naasax" className={TAB_TRIGGER_STYLES}>
						NaasaX
					</TabsTrigger>
					<TabsTrigger value="meroshare" className={TAB_TRIGGER_STYLES}>
						Meroshare
					</TabsTrigger>
				</TabsList>

				<TabsContent value={AccountType.TMS} className="mt-0">
					{tmsAccounts.length === 0 ? (
						<EmptyAccounts accountType={AccountType.TMS} />
					) : (
						<Card className="bg-transparent border-0">
							<CardContent className="p-0 space-y-2">
								{tmsAccounts.map((account) => (
									<div
										key={account.alias}
										className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{account.alias}</span>

												<Badge
													variant="secondary"
													className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
												>
													{account.broker}
												</Badge>

												{account.isPrimary && (
													<Badge
														variant="secondary"
														className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
													>
														Primary
													</Badge>
												)}
											</div>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleEditAccount(account.alias)}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											{account.isPrimary ? (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-yellow-500"
													onClick={handleMakePrimary(account.alias)}
												>
													<Star className="h-4 w-4 fill-current" />
												</Button>
											) : (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-zinc-400 hover:text-white"
													onClick={handleMakePrimary(account.alias)}
												>
													<Star className="h-4 w-4" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleDeleteAccount(account.alias)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value={AccountType.NAASAX} className="mt-0">
					{naasaxAccounts.length === 0 ? (
						<EmptyAccounts accountType={AccountType.NAASAX} />
					) : (
						<Card className="bg-transparent border-0">
							<CardContent className="p-0 space-y-2">
								{naasaxAccounts.map((account) => (
									<div
										key={account.alias}
										className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{account.alias}</span>
												{account.broker && (
													<Badge
														variant="secondary"
														className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
													>
														{account.broker}
													</Badge>
												)}
												{account.isPrimary && (
													<Badge
														variant="secondary"
														className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
													>
														Primary
													</Badge>
												)}
											</div>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleEditAccount(account.alias)}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											{account.isPrimary ? (
												<div className="h-8 w-8 flex items-center justify-center text-yellow-500">
													<Star className="h-4 w-4 fill-current" />
												</div>
											) : (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-zinc-400 hover:text-white"
													onClick={handleMakePrimary(account.alias)}
												>
													<Star className="h-4 w-4" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleDeleteAccount(account.alias)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value={AccountType.MEROSHARE} className="mt-0">
					{meroAccounts.length === 0 ? (
						<EmptyAccounts accountType={AccountType.MEROSHARE} />
					) : (
						<Card className="bg-transparent border-0">
							<CardContent className="p-0 space-y-2">
								{meroAccounts.map((account) => (
									<div
										key={account.alias}
										className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{account.alias}</span>
												{account.broker && (
													<Badge
														variant="secondary"
														className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
													>
														{account.broker}
													</Badge>
												)}
												{account.isPrimary && (
													<Badge
														variant="secondary"
														className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
													>
														Primary
													</Badge>
												)}
											</div>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleEditAccount(account.alias)}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											{account.isPrimary ? (
												<div className="h-8 w-8 flex items-center justify-center text-yellow-500">
													<Star className="h-4 w-4 fill-current" />
												</div>
											) : (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-zinc-400 hover:text-white"
													onClick={handleMakePrimary(account.alias)}
												>
													<Star className="h-4 w-4" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-zinc-400 hover:text-white"
												onClick={handleDeleteAccount(account.alias)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			<BackButton
				showBack={true}
				showAdd={() => setIsAddingAccount(true)}
				showOptions={() => setIsOptionOpen(true)}
			/>

			{editingAccount ? (
				<Suspense fallback={<Loading />}>
					<EditAccountForm
						accounts={accounts}
						editingAccount={editingAccount}
						onClose={() => setEditingAccount(null)}
					/>
				</Suspense>
			) : null}

			{isAddingAccount ? (
				<Suspense fallback={<Loading />}>
					<AddAccountForm
						activeTab={activeTab}
						onClose={() => setIsAddingAccount(false)}
					/>
				</Suspense>
			) : null}

			{isOptionOpen ? (
				<OptionsDialog onOpenChange={() => setIsOptionOpen(false)} />
			) : null}
		</div>
	);
}
