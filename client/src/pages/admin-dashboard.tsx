import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMessagesBetween, useSendMessage } from "@/hooks/use-messages";
import { AdminStatusComponent } from "@/components/admin-status";
import { UserList } from "@/components/user-list";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@shared/schema";
import { MessageCircle, Menu, LogOut, Send, Smile, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: messages = [] } = useMessagesBetween(
    user?.id,
    selectedUser?.id
  );

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const sendMessageMutation = useSendMessage();

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !user) return;

    sendMessageMutation.mutate(
      {
        senderId: user.id,
        receiverId: selectedUser.id,
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

  const nonAdminUsers = users.filter((u: User) => !u.isAdmin);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">Sohbet Sistemi</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <AdminStatusComponent showToggle />
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user.name.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} title="Çıkış Yap">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-80 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 h-full`}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Kullanıcılar</h2>
            </div>
            
            <div className="relative">
              <Input
                type="text"
                placeholder="Kullanıcı ara..."
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                🔍
              </div>
            </div>
          </div>

          <UserList
            selectedUserId={selectedUser?.id}
            onUserSelect={(user) => {
              setSelectedUser(user);
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            currentUserId={user.id}
          />

          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center">
              Toplam {nonAdminUsers.length} kullanıcı
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{selectedUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-500">Çevrimiçi</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    sender={getUserById(message.senderId)}
                    currentUserId={user.id}
                  />
                ))}
                
                {messages.length === 0 && (
                  <div className="flex justify-center">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
                      {selectedUser.name} ile sohbetiniz başladı
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <Button type="button" variant="ghost" size="sm">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium mb-2">Bir kullanıcı seçin</h3>
                <p>Sohbet başlatmak için sol taraftan bir kullanıcı seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
