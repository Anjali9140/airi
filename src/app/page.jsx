"use client"
import {
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    Attachment,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
} from "@/components/ai-elements/attachments";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageBranch,
    MessageBranchContent,
    MessageBranchNext,
    MessageBranchPage,
    MessageBranchPrevious,
    MessageBranchSelector,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction,
} from "@/components/ai-elements/message";
import {
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtHeader,
    ChainOfThoughtImage,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Image } from "@/components/ai-elements/image";
import { ImageIcon, SearchIcon } from "lucide-react";
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputBody,
    PromptInputButton,
    PromptInputFooter,
    PromptInputHeader,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
    usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRepeatAll20Regular, Copy20Regular, Search24Regular } from "@fluentui/react-icons";
import { ReactionBar } from "@/components/ui/reaction-bar";
import { callAgentAPI } from "@/lib/agent-api";

const exampleImage = {
    // Note: Paste your original full base64 string here
    base64: "/9j/4AAQSkZJRgABAgEASABIAAD...",
    mediaType: "image/jpeg",
    uint8Array: new Uint8Array([]),
};

const reactions = [
    { id: "like", emoji: "👍", label: "Like", color: "rgb(var(--color-like))" },
    { id: "love", emoji: "❤️", label: "Love", color: "rgb(var(--color-love))" },
    { id: "haha", emoji: "😂", label: "Haha", color: "rgb(var(--color-haha))" },
    { id: "wow", emoji: "😮", label: "Wow", color: "rgb(var(--color-wow))" },
    { id: "sad", emoji: "😢", label: "Sad", color: "rgb(var(--color-sad))" },
    { id: "angry", emoji: "😡", label: "Angry", color: "rgb(var(--color-angry))" },
]

const initialMessages = [];
const suggestions = [
    "What are the latest trends in AI?",
    "How does machine learning work?",
    "Explain quantum computing"
];

const AttachmentItem = ({
    attachment,
    onRemove,
}) => {
    const handleRemove = useCallback(() => {
        onRemove(attachment.id);
    }, [onRemove, attachment.id]);

    return (
        <Attachment data={attachment} onRemove={handleRemove}>
            <AttachmentPreview />
            <AttachmentRemove />
        </Attachment>
    );
};

const PromptInputAttachmentsDisplay = () => {
    const attachments = usePromptInputAttachments();

    const handleRemove = useCallback(
        (id) => {
            attachments.remove(id);
        },
        [attachments]
    );

    if (attachments.files.length === 0) {
        return null;
    }

    return (
        <Attachments variant="inline">
            {attachments.files.map((attachment) => (
                <AttachmentItem
                    attachment={attachment}
                    key={attachment.id}
                    onRemove={handleRemove}
                />
            ))}
        </Attachments>
    );
};

const SuggestionItem = ({
    suggestion,
    onClick,
}) => {
    const handleClick = useCallback(() => {
        onClick(suggestion);
    }, [onClick, suggestion]);

    return <Suggestion onClick={handleClick} suggestion={suggestion} />;
};

export default function Page() {
    const [text, setText] = useState("");
    const [useWebSearch, setUseWebSearch] = useState(false);
    const [status, setStatus] = useState("ready");
    const [messages, setMessages] = useState(initialMessages);
    const [, setStreamingMessageId] = useState(null);
    const [userId] = useState("ansh");
    const [chatId] = useState(`chat-${Date.now()}`);

    const updateMessageContent = useCallback(
        (messageId, newContent) => {
            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg.versions.some((v) => v.id === messageId)) {
                        return {
                            ...msg,
                            versions: msg.versions.map((v) =>
                                v.id === messageId ? { ...v, content: newContent } : v
                            ),
                        };
                    }
                    return msg;
                })
            );
        },
        []
    );

    const streamResponse = useCallback(
        async (messageId, userPrompt) => {
            setStatus("streaming");
            setStreamingMessageId(messageId);

            let displayContent = "";
            let isStreamComplete = false;
            let tokenQueue = [];

            // The animation loop that reveals text token-by-token
            const renderQueue = () => {
                if (tokenQueue.length > 0) {
                    const nextToken = tokenQueue.shift();
                    displayContent += nextToken;
                    updateMessageContent(messageId, displayContent);
                }

                // Keep looping if the stream isn't done or if there are still tokens to display
                if (!isStreamComplete || tokenQueue.length > 0) {
                    setTimeout(renderQueue, 30); // 30ms delay between tokens
                } else {
                    setStatus("ready");
                    setStreamingMessageId(null);
                }
            };

            // Start the animation loop
            renderQueue();

            try {
                await callAgentAPI({
                    prompt: userPrompt,
                    userId,
                    chatId,
                    onTextChunk: (chunk) => {
                        // Push text chunks into the queue instead of rendering immediately
                        tokenQueue.push(chunk);
                    },
                    onComplete: () => {
                        isStreamComplete = true;
                    },
                    onError: (error) => {
                        console.error("API Error:", error);
                        toast.error("Error", {
                            description: "Failed to get response from API",
                        });
                        isStreamComplete = true; // Stop the animation loop on error
                    },
                });
            } catch (error) {
                console.error("Streaming error:", error);
                toast.error("Error", {
                    description: "Failed to stream response",
                });
                isStreamComplete = true; // Stop the animation loop on error
            }
        },
        [updateMessageContent, userId, chatId]
    );

    const addUserMessage = useCallback(
        (content) => {
            const userMessage = {
                from: "user",
                key: `user-${Date.now()}`,
                versions: [
                    {
                        content,
                        id: `user-${Date.now()}`,
                    },
                ],
            };

            setMessages((prev) => [...prev, userMessage]);

            // Create assistant message placeholder
            const assistantMessageId = `assistant-${Date.now()}`;
            const assistantMessage = {
                from: "assistant",
                key: `assistant-${Date.now()}`,
                versions: [
                    {
                        content: "",
                        id: assistantMessageId,
                    },
                ],
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Stream response from API
            streamResponse(assistantMessageId, content);
        },
        [streamResponse]
    );

    const handleSubmit = useCallback(
        (message) => {
            const hasText = Boolean(message.text);
            const hasAttachments = Boolean(message.files?.length);

            if (!(hasText || hasAttachments)) {
                return;
            }

            setStatus("submitted");

            if (message.files?.length) {
                toast.success("Files attached", {
                    description: `${message.files.length} file(s) attached to message`,
                });
            }

            addUserMessage(message.text || "Sent with attachments");
            setText("");
        },
        [addUserMessage]
    );

    const handleSuggestionClick = useCallback(
        (suggestion) => {
            setStatus("submitted");
            addUserMessage(suggestion);
        },
        [addUserMessage]
    );

    const handleTranscriptionChange = useCallback((transcript) => {
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }, []);

    const handleTextChange = useCallback(
        (event) => {
            setText(event.target.value);
        },
        []
    );

    const toggleWebSearch = useCallback(() => {
        setUseWebSearch((prev) => !prev);
    }, []);

    const isSubmitDisabled = useMemo(
        () => !(text.trim() || status) || status === "streaming",
        [text, status]
    );

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex w-full items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="titlebar"></div>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-3xl w-full overflow-hidden mx-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
                <div className="relative h-full w-full flex-1 rounded-xl">
                    <div className="flex size-full flex-col divide-y overflow-hidden mb-56">
                        <Conversation className="mb-52">
                            <ConversationContent>
                                {messages.map(({ versions, ...message }) => (
                                    <MessageBranch defaultBranch={0} key={message.key}>
                                        <MessageBranchContent>
                                            {versions.map((version) => (
                                                <>
                                                    <Message
                                                        from={message.from}
                                                        key={`${message.key}-${version.id}`}
                                                    >
                                                        <div>
                                                            {message.sources?.length && (
                                                                <Sources>
                                                                    <SourcesTrigger count={message.sources.length} />
                                                                    <SourcesContent>
                                                                        {message.sources.map((source) => (
                                                                            <Source
                                                                                href={source.href}
                                                                                key={source.href}
                                                                                title={source.title}
                                                                            />
                                                                        ))}
                                                                    </SourcesContent>
                                                                </Sources>
                                                            )}

                                                            {message.reasoning && (
                                                                <>
                                                                    <Reasoning duration={message.reasoning.duration}>
                                                                        <ReasoningTrigger />
                                                                        <ReasoningContent>
                                                                            {message.reasoning.content}
                                                                        </ReasoningContent>
                                                                    </Reasoning>
                                                                    <ChainOfThought defaultOpen={false}>
                                                                        <ChainOfThoughtHeader />
                                                                        <ChainOfThoughtContent>
                                                                            <ChainOfThoughtStep
                                                                                icon={SearchIcon}
                                                                                label="Searching for profiles for Hayden Bleasel"
                                                                                status="complete"
                                                                            >
                                                                                <ChainOfThoughtSearchResults>
                                                                                    {[
                                                                                        "https://www.x.com",
                                                                                        "https://www.instagram.com",
                                                                                        "https://www.github.com",
                                                                                    ].map((website) => (
                                                                                        <ChainOfThoughtSearchResult key={website}>
                                                                                            {new URL(website).hostname}
                                                                                        </ChainOfThoughtSearchResult>
                                                                                    ))}
                                                                                </ChainOfThoughtSearchResults>
                                                                            </ChainOfThoughtStep>

                                                                            <ChainOfThoughtStep
                                                                                icon={ImageIcon}
                                                                                label="Found the profile photo for Hayden Bleasel"
                                                                                status="complete"
                                                                            >
                                                                                <ChainOfThoughtImage caption="Hayden Bleasel's profile photo from x.com, showing a Ghibli-style man.">
                                                                                    <Image
                                                                                        {...exampleImage}
                                                                                        alt="Example generated image"
                                                                                        className="aspect-square h-[150px] border"
                                                                                    />
                                                                                </ChainOfThoughtImage>
                                                                            </ChainOfThoughtStep>
                                                                        </ChainOfThoughtContent>
                                                                    </ChainOfThought>
                                                                </>
                                                            )}

                                                            <MessageContent>
                                                                <MessageResponse>
                                                                    {version.content}
                                                                </MessageResponse>
                                                            </MessageContent>
                                                        </div>
                                                    </Message>
                                                    {message.from === "assistant" && status !== "streaming" && messages[messages.length - 1]?.key === message.key && (
                                                        <MessageActions>
                                                            <ReactionBar
                                                                reactions={reactions}
                                                                defaultReaction={reactions[0]}
                                                                onReactionSelect={(reaction) => console.log("Selected reaction:", reaction)}
                                                                variant="ghost"
                                                                size="sm"
                                                                showLabel
                                                                imageSize={20}
                                                                popoverPosition="top"
                                                                popoverClassName="bg-secondary"
                                                                emojiSize={16}
                                                                className="rounded-3xl min-w-fit px-1.5 text-sm font-normal"
                                                            />
                                                            <MessageAction
                                                                onClick={() => console.log("Regenerate response for message id:", message.key)}
                                                                label="Retry"
                                                            >
                                                                <ArrowRepeatAll20Regular />
                                                            </MessageAction>
                                                            <MessageAction
                                                                onClick={() =>
                                                                    navigator.clipboard.writeText(version.content)
                                                                }
                                                                label="Copy"
                                                            >
                                                                <Copy20Regular />
                                                            </MessageAction>
                                                        </MessageActions>
                                                    )}
                                                </>
                                            ))}
                                        </MessageBranchContent>
                                        {versions.length > 1 && (
                                            <MessageBranchSelector>
                                                <MessageBranchPrevious />
                                                <MessageBranchPage />
                                                <MessageBranchNext />
                                            </MessageBranchSelector>
                                        )}


                                    </MessageBranch>
                                ))}
                                {!messages.length && (
                                    <div className="flex flex-col items-start justify-center py-16 absolute bottom-0">
                                        <h4 className="text-xl font-normal tracking-tight">
                                            Hi Ansh
                                        </h4>
                                        <h3 className="text-[28px] font-semibold tracking-tight">
                                            Where should we start?
                                        </h3>
                                    </div>
                                )}
                            </ConversationContent>
                            <ConversationScrollButton />
                        </Conversation>
                    </div>
                    <div className="grid shrink-0 gap-4 pt-4 absolute bottom-0 bg-background">
                        <Suggestions className="px-4">
                            {suggestions.map((suggestion) => (
                                <SuggestionItem
                                    key={suggestion}
                                    onClick={handleSuggestionClick}
                                    suggestion={suggestion}
                                />
                            ))}
                        </Suggestions>
                        <div className="w-full px-4 pb-4">
                            <PromptInput globalDrop multiple onSubmit={handleSubmit}>
                                <PromptInputHeader>
                                    <PromptInputAttachmentsDisplay />
                                </PromptInputHeader>
                                <PromptInputBody>
                                    <PromptInputTextarea onChange={handleTextChange} value={text} />
                                </PromptInputBody>
                                <PromptInputFooter>
                                    <PromptInputTools>
                                        <PromptInputActionMenu>
                                            <PromptInputActionMenuTrigger />
                                            <PromptInputActionMenuContent>
                                                <PromptInputActionAddAttachments />
                                            </PromptInputActionMenuContent>
                                        </PromptInputActionMenu>
                                        <SpeechInput
                                            className="shrink-0"
                                            onTranscriptionChange={handleTranscriptionChange}
                                            size="icon-sm"
                                            variant="ghost"
                                        />
                                        <PromptInputButton
                                            onClick={toggleWebSearch}
                                            variant={useWebSearch ? "default" : "ghost"}
                                        >
                                            <Search24Regular size={16} />
                                            <span>Search</span>
                                        </PromptInputButton>
                                    </PromptInputTools>
                                    <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
                                </PromptInputFooter>
                            </PromptInput>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}