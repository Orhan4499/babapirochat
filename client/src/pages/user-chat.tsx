import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMessagesBetween, useSendMessage } from "@/hooks/use-messages";
import { AdminStatusComponent } from "@/components/admin-status";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@shared/schema";
import { MessageCircle, LogOut, Send, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserChat() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState("");

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Find admin user
  const adminUser = allUsers.find((u: User) => u.isAdmin);

  const { data: messages = [] } = useMessagesBetween(
    user?.id,
    adminUser?.id
  );

  const sendMessageMutation = useSendMessage();

  if (user?.isAdmin) {
    setLocation("/admin");
    return null;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !adminUser) return;

    sendMessageMutation.mutate(
      {
        senderId: user.id,
        receiverId: adminUser.id,
        content: messageInput.trim(),
      },
      {
        onSuccess: () => {
          setMessageInput("");
        },
        onError: () => {
          toast({
            title: "Hata",
            description: "Mesaj gönderilemedi",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getUserById = (id: string) => {
    return allUsers.find((u: User) => u.id === id);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Admin ile Sohbet</h1>
              <p className="text-xs text-slate-500">Sorularınız için buradan yazabilirsiniz</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <AdminStatusComponent />

            <Button variant="ghost" size="sm" onClick={handleLogout} title="Çıkış Yap">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        <div className="flex justify-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
            Admin ile sohbetiniz başladı. Sorularınızı yazabilirsiniz.
          </div>
        </div>

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            sender={getUserById(message.senderId)}
            currentUserId={user.id}
          />
        ))}

        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-8">
            <p>Henüz mesaj yok. İlk mesajınızı gönderin!</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="rounded-full pr-12"
            />
            <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            size="sm"
            className="rounded-full w-12 h-12 p-0"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
