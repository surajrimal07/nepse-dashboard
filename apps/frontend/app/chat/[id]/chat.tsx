/** biome-ignore-all lint/a11y/noStaticElementInteractions: <ok> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <ok> */
"use client";

import { useChat } from "@ai-sdk/react";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import type { Id } from "@nepse-dashboard/convex/convex/_generated/dataModel";
import {
	Checkpoint,
	CheckpointIcon,
	CheckpointTrigger,
} from "@nepse-dashboard/ui/components/ai-elements/checkpoint";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@nepse-dashboard/ui/components/ai-elements/conversation";
import {
	MessageAction,
	MessageActions,
	MessageContent,
	Message as MessageElement,
	MessageResponse,
} from "@nepse-dashboard/ui/components/ai-elements/message";
import {
	PromptInput,
	PromptInputActionAddAttachments,
	PromptInputActionMenu,
	PromptInputActionMenuContent,
	PromptInputActionMenuItem,
	PromptInputActionMenuTrigger,
	PromptInputAttachment,
	PromptInputAttachments,
	PromptInputBody,
	PromptInputFooter,
	PromptInputHeader,
	type PromptInputMessage,
	PromptInputSpeechButton,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
	usePromptInputController,
} from "@nepse-dashboard/ui/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@nepse-dashboard/ui/components/ai-elements/reasoning";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@nepse-dashboard/ui/components/ai-elements/sources";
import { Button } from "@nepse-dashboard/ui/components/button";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useMutation, useQuery } from "convex/react";
import {
	BookmarkCheckIcon,
	BookmarkPlusIcon,
	BookOpen,
	CheckIcon,
	CopyIcon,
	Loader,
	MonitorSmartphoneIcon,
	PaperclipIcon,
	RefreshCcwIcon,
	SquareMenu,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/utils/tools";
import { ChatSidebar } from "../chat-sidebar";
import { EmptyChatState } from "../empty-chat-state";
import Loading from "../loading";
import { NepseStatusCard } from "../nepse-is-open";
import RequiresExtension from "../require-extension";
import {
	sendToExtension,
	useExtensionInitialization,
} from "../useExtensionInitialization";

export default function ChatPage({
	chatId,
	query,
	initialMessages,
}: {
	chatId: Id<"chats">;
	query?: string | null;
	initialMessages: ChatMessage[];
}) {
	const router = useRouter();
	const controller = usePromptInputController();
	const [copied, setCopied] = useState(false);

	const [showHistory, setShowHistory] = useState(false);
	const { isConnected, user, aiConfig, isInitializing } =
		useExtensionInitialization();

	const addCheckPoint = useMutation(api.chat.createCheckpoint);
	const restoreCheckPoint = useMutation(api.chat.restoreCheckpoint);
	const removeCheckpoint = useMutation(api.chat.removeCheckpoint);

	const chats =
		useQuery(
			api.chat.getChats,
			isConnected && user.current?.email
				? { email: user.current.email }
				: "skip",
		) || [];

	const checkpoints =
		useQuery(api.chat.getCheckpoint, isConnected ? { chatId } : "skip") || [];

	const totalTokensUsed =
		useQuery(
			api.chat.getAllTokens,
			isConnected && user.current?.email
				? { email: user.current.email }
				: "skip",
		) || 0;

	const { messages, setMessages, sendMessage, status, regenerate } =
		useChat<ChatMessage>({
			sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls, // not sure about this one
			id: chatId,
			messages: initialMessages,
			experimental_throttle: 50,
			transport: new DefaultChatTransport({
				prepareSendMessagesRequest: ({ messages, id }) => ({
					body: {
						authUser: user.current,
						aiConfig: aiConfig.current,
						chatId: chatId,
						messages,
						id,
					},
				}),
			}),

			onError: (error) => {
				toast.error(`Error: ${error.message}`);
			},
		});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <no need>
	useEffect(() => {
		const q = query?.trim();
		if (q) {
			controller.textInput.setInput(q);
		}
	}, [query]);

	const handleCopy = (content: string) => {
		navigator.clipboard.writeText(content);
		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 1800);
	};

	const createCheckpoint = async (messageIndex: number) => {
		try {
			await addCheckPoint({
				chatId,
				messageIndex,
			});
			toast.success("Checkpoint created");
		} catch {
			toast.error("Failed to create checkpoint");
		}
	};

	const removeToCheckpoint = async (_id: Id<"messagecheckpoints">) => {
		try {
			await removeCheckpoint({ _id });

			toast.success("Checkpoint removed");
		} catch {
			toast.error("Failed to remove checkpoint");
		}
	};

	const restoreToCheckpoint = async (messageIndex: number) => {
		try {
			await restoreCheckPoint({
				chatId,
				messageIndex,
			});
			setMessages(messages.slice(0, messageIndex + 1));

			toast.success("Restored to checkpoint");
		} catch {
			toast.error("Failed to restore checkpoint");
		}
	};

	const handleSubmit = (message: PromptInputMessage) => {
		const hasText = Boolean(message.text);
		const hasAttachments = Boolean(message.files?.length);
		if (!(hasText || hasAttachments)) {
			return;
		}

		sendMessage({
			text: message.text || "Sent with attachments",
			files: message.files,
		});

		const isFirstMessage = messages.length === 0;

		if (isFirstMessage) {
			fetch(`/api/title`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					authUser: user.current,
					aiConfig: aiConfig.current,
					chatId,
					humanMessage: message.text,
				}),
			});
		}
	};

	const handleDeleteChat = (chatToBeDeleted: Id<"chats">) => {
		toast.promise(
			(async () => {
				const result = await fetch(`/api/chat`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ chatId: chatToBeDeleted }),
				});

				if (!result.ok) {
					throw new Error("Failed to delete chat");
				}

				return { chatToBeDeleted };
			})(),
			{
				loading: "Deleting chat...",
				success: ({ chatToBeDeleted }) => {
					if (chatId === chatToBeDeleted) {
						router.push("/chat");
					}
					return "Chat deleted successfully";
				},
				error: (err) => err.message || "Failed to delete chat",
			},
		);
	};

	const handleChatClick = (chatIdToGo: Id<"chats">) => {
		setShowHistory(false);
		if (chatId === chatIdToGo) return;

		router.push(`/chat/${chatIdToGo}`);
	};

	const handleNewChat = () => {
		setShowHistory(false);
		router.push(`/chat`);
	};

	if (isInitializing) {
		return <Loading />;
	}

	if (!isConnected) return <RequiresExtension />;

	return (
		<div className="h-screen w-full bg-neutral-950">
			<Button
				variant="ghost"
				aria-expanded={showHistory}
				onClick={() => setShowHistory((prev) => !prev)}
				className="fixed left-1 top-1 z-20 h-10 w-10 rounded-lg "
				size="icon"
			>
				<SquareMenu className="h-8 w-8" />
			</Button>

			<ChatSidebar
				isOpen={showHistory}
				onClose={() => setShowHistory(false)}
				chats={chats}
				currentChatId={chatId}
				totalTokensUsed={totalTokensUsed}
				onChatClick={handleChatClick}
				onNewChat={handleNewChat}
				onDeleteChat={handleDeleteChat}
			/>

			<div className="relative max-w-lg mx-auto h-full flex flex-col">
				<Conversation className="h-full">
					<ConversationContent>
						{!messages || messages.length === 0 ? (
							<EmptyChatState
								chats={chats}
								onChatClick={handleChatClick}
								onSuggestedTopicClick={(topic) => {
									controller.textInput.setInput(topic);
									// simulate the submit here
									//handleSubmit(); asks for params but i want to trigger enter naturally
								}}
							/>
						) : (
							messages?.map((message, index) => {
								const checkpoint = checkpoints.find(
									(cp) => cp.messageIndex === index,
								);
								return (
									<Fragment key={message.id}>
										<div>
											{message.role === "assistant" &&
												message.parts.filter(
													(part) => part.type === "source-url",
												).length > 0 && (
													<Sources>
														<SourcesTrigger
															count={
																message.parts.filter(
																	(part) => part.type === "source-url",
																).length
															}
														/>
														{message.parts
															.filter((part) => part.type === "source-url")
															.map((part, i) => (
																<SourcesContent key={`${message.id}-${i}`}>
																	<Source
																		key={`${message.id}-${i}`}
																		href={part.url}
																		title={part.url}
																	/>
																</SourcesContent>
															))}
													</Sources>
												)}

											{message.parts.map((part, i) => {
												switch (part.type) {
													case "text": {
														const messageCheckpoint = checkpoints.find(
															(cp) => cp.messageIndex === index,
														);
														return (
															<MessageElement
																key={`${message.id}-${i}`}
																from={message.role}
															>
																<MessageContent>
																	<MessageResponse>{part.text}</MessageResponse>
																</MessageContent>

																{message.role === "assistant" && (
																	<MessageActions className="mt-2 opacity-80 hover:opacity-100 transition">
																		<MessageAction
																			label="Retry"
																			tooltip="Regenerate response"
																			onClick={() => regenerate()}
																		>
																			<RefreshCcwIcon className="size-4" />
																		</MessageAction>
																		<MessageAction
																			label={
																				copied[message.id] ? "Copied!" : "Copy"
																			}
																			tooltip={
																				copied[message.id]
																					? "Copied!"
																					: "Copy to clipboard"
																			}
																			onClick={() => handleCopy(part.text)}
																		>
																			{copied[message.id] ? (
																				<CheckIcon className="size-4" />
																			) : (
																				<CopyIcon className="size-4" />
																			)}
																		</MessageAction>
																		<MessageAction
																			label={
																				messageCheckpoint
																					? "Remove Checkpoint"
																					: "Checkpoint"
																			}
																			tooltip={
																				messageCheckpoint
																					? "Remove checkpoint from this message"
																					: "Create checkpoint at this message"
																			}
																			onClick={() =>
																				messageCheckpoint
																					? removeToCheckpoint(
																							messageCheckpoint._id,
																						)
																					: createCheckpoint(index)
																			}
																		>
																			{messageCheckpoint ? (
																				<BookmarkCheckIcon className="size-4" />
																			) : (
																				<BookmarkPlusIcon className="size-4" />
																			)}
																		</MessageAction>
																	</MessageActions>
																)}
															</MessageElement>
														);
													}

													case "file":
														return (
															<div key={`${message.id}-${i}`} className="mt-2">
																{part.mediaType?.startsWith("image/") && (
																	<div className="flex items-center gap-2 bg-neutral-900/40 p-2 rounded-lg border border-neutral-700">
																		<Image
																			src={part.url}
																			alt={part.filename ?? "image"}
																			width={120}
																			height={120}
																			className="rounded-lg object-cover opacity-90"
																		/>
																		<span className="text-xs text-neutral-400">
																			Image attached
																		</span>
																	</div>
																)}
																{part.mediaType?.startsWith(
																	"application/pdf",
																) && (
																	<div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-700 text-xs">
																		📄 PDF attached: {part.filename}
																	</div>
																)}
															</div>
														);

													case "tool-IsNepseOpen":
														switch (part.state) {
															case "output-available":
																return (
																	<div
																		key={`${message.id}-nepse-status-${i}`}
																		className="mt-2 mb-2"
																	>
																		<NepseStatusCard statusData={part.output} />
																	</div>
																);

															case "output-error":
																return (
																	<div
																		key={`${message.id}-nepse-error-${i}`}
																		className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
																	>
																		<div className="text-sm text-red-400">
																			Error: {part.errorText}
																		</div>
																	</div>
																);

															default:
																return null;
														}
													case "reasoning":
														return (
															<Reasoning
																key={`${message.id}-${i}`}
																className="w-full"
																isStreaming={
																	status === "streaming" &&
																	i === message.parts.length - 1 &&
																	message.id === messages.at(-1)?.id
																}
															>
																<ReasoningTrigger />
																<ReasoningContent>{part.text}</ReasoningContent>
															</Reasoning>
														);
													default:
														return null;
												}
											})}
										</div>

										{checkpoint && (
											<Checkpoint>
												<CheckpointIcon />
												<CheckpointTrigger
													onClick={() =>
														restoreToCheckpoint(checkpoint.messageIndex)
													}
												>
													Restore checkpoint
												</CheckpointTrigger>
											</Checkpoint>
										)}
									</Fragment>
								);
							})
						)}
						{status === "submitted" && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				{/* <Suggestions className="px-4">
					{suggestions.map((suggestion) => (
						<Suggestion
							key={suggestion}
							onClick={"do nothing" as unknown as () => void}
							suggestion={suggestion}
						/>
					))}
				</Suggestions> */}

				<PromptInput
					onSubmit={handleSubmit}
					className="mt-4"
					globalDrop
					multiple
					maxFiles={1}
					onError={() => toast.error("Maximum of 1 file allowed")}
					maxFileSize={10 * 1024 * 1024} // 10MB
				>
					<PromptInputHeader>
						<PromptInputAttachments>
							{(attachment) => <PromptInputAttachment data={attachment} />}
						</PromptInputAttachments>
					</PromptInputHeader>
					<PromptInputBody>
						<PromptInputTextarea />
					</PromptInputBody>
					<PromptInputFooter>
						<PromptInputTools>
							<PromptInputActionMenu>
								<PromptInputActionMenuTrigger
									className="
													inline-flex items-center gap-2
													px-4 py-1.5
													rounded-full
													border border-neutral-700
													text-neutral-300 text-sm font-medium
													hover:bg-neutral-800
													transition-colors
												"
								>
									<PaperclipIcon className="w-4 h-4 text-neutral-300" />
									Attach
								</PromptInputActionMenuTrigger>
								<PromptInputActionMenuContent>
									<PromptInputActionAddAttachments />
									<PromptInputActionMenuItem
										className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800 cursor-pointer"
										onClick={() => sendToExtension("TAKE_SCREENSHOT")}
									>
										<MonitorSmartphoneIcon className="w-4 h-4" />
										Attach Screenshot
									</PromptInputActionMenuItem>
									<PromptInputActionMenuItem
										className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800 cursor-pointer"
										onClick={() => sendToExtension("ADD_WEB_CONTENT")}
									>
										<BookOpen className="w-4 h-4" />
										Attach Webpage
									</PromptInputActionMenuItem>
								</PromptInputActionMenuContent>
							</PromptInputActionMenu>
							<PromptInputSpeechButton />
						</PromptInputTools>
						<PromptInputSubmit status={status} />
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
