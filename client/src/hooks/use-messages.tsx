import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Message, InsertMessage } from "@shared/schema";

export function useMessages(userId?: string) {
  return useQuery({
    queryKey: ["/api/messages", userId],
    enabled: !!userId,
    refetchInterval: 2000, // Poll every 2 seconds for real-time effect
  });
}

export function useMessagesBetween(userId1?: string, userId2?: string) {
  return useQuery<Message[]>({
    queryKey: ["/api/messages/between", userId1, userId2],
    enabled: !!userId1 && !!userId2,
    refetchInterval: 2000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: InsertMessage) => {
      const response = await apiRequest("POST", "/api/messages", message);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant message queries
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/between", variables.senderId, variables.receiverId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages/between", variables.receiverId, variables.senderId] 
      });
    },
  });
}
