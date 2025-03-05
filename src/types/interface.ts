export interface Message {
    id: string;
    text: string;
    by: "user" | "bot";
  }