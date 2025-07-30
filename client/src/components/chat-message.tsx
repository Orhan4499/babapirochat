import { Message, User } from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ChatMessageProps {
  message: Message;
  sender: User | undefined;
  currentUserId: string;
}

export function ChatMessage({ message, sender, currentUserId }: ChatMessageProps) {
  const isOwnMessage = message.senderId === currentUserId;
  const messageTime = message.createdAt ? format(new Date(message.createdAt), "HH:mm", { locale: tr }) : "";
  
  const senderInitial = sender?.name.charAt(0).toUpperCase() || "?";
  const isAdmin = sender?.isAdmin;

  if (isOwnMessage) {
    return (
      <div className="flex items-start space-x-3 justify-end">
        <div className="flex-1 text-right">
          <div className="bg-blue-600 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm max-w-md ml-auto">
            <p className="text-white">{message.content}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1 mr-2">{messageTime}</p>
        </div>
        <div className={`w-8 h-8 ${isAdmin ? 'bg-slate-600' : 'bg-green-500'} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-medium text-xs">{senderInitial}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 ${
        isAdmin 
          ? 'bg-slate-600' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500'
      } rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-medium text-xs">{senderInitial}</span>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-200 max-w-md">
          <p className="text-slate-800">{message.content}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1 ml-2">{messageTime}</p>
      </div>
    </div>
  );
}
