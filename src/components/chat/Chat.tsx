import { SuggestedPrompts } from "./SuggestedPrompts";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function Chat() {
  return (
    <div data-component="Chat">
      Chat
      <SuggestedPrompts />
      <ChatMessage />
      <ChatInput />
    </div>
  );
}
