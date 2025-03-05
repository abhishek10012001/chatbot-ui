export interface Message {
    id: string;
    text: string;
    by: "user" | "bot";
}

export interface ChatWidgetProps {
    userId: string;
    initialMessages: Message[];
}