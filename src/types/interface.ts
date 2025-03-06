/**
 * Represents a chat message exchanged between the user and the bot.
 */
export interface Message {
    /** Unique identifier for the message */
    id: string;

    /** The text content of the message */
    text: string;

    /** Specifies the sender of the message: either the user or the bot */
    by: "user" | "bot";
}

/**
 * Props for the ChatWidget component.
 */
export interface ChatWidgetProps {
    /** The unique user ID */
    userId: string;
    
    /** Initial messages for the chat */
    initialMessages: Message[];
}