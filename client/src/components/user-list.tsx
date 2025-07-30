import { useQuery } from "@tanstack/react-query";
import { User, Message } from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface UserListProps {
  selectedUserId?: string;
  onUserSelect: (user: User) => void;
  currentUserId: string;
}

export function UserList({ selectedUserId, onUserSelect, currentUserId }: UserListProps) {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    refetchInterval: 10000,
  });

  const getLastMessage = (userId: string) => {
    // This would ideally be optimized with a separate API call
    // For now, we'll show placeholder text
    return "Merhaba, nasılsınız?";
  };

  const getLastMessageTime = () => {
    return format(new Date(), "HH:mm", { locale: tr });
  };

  const getUnreadCount = () => {
    // This would come from a separate unread messages API
    return Math.floor(Math.random() * 3); // Placeholder
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId;
        const userInitial = user.name.charAt(0).toUpperCase();
        const unreadCount = getUnreadCount();
        
        return (
          <div
            key={user.id}
            onClick={() => onUserSelect(user)}
            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
              isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{userInitial}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  Son mesaj: {getLastMessage(user.id)}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-xs text-slate-400">{getLastMessageTime()}</span>
                {unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {users.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <p>Henüz kayıtlı kullanıcı yok</p>
        </div>
      )}
    </div>
  );
}
