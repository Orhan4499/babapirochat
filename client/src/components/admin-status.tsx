import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminStatus, UpdateAdminStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface AdminStatusProps {
  showToggle?: boolean;
  className?: string;
}

export function AdminStatusComponent({ showToggle = false, className = "" }: AdminStatusProps) {
  const queryClient = useQueryClient();
  
  const { data: status } = useQuery<AdminStatus>({
    queryKey: ["/api/admin/status"],
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: UpdateAdminStatus) => {
      const response = await apiRequest("PUT", "/api/admin/status", newStatus);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
    },
  });

  const toggleStatus = () => {
    const newStatus = status?.status === "available" ? "busy" : "available";
    updateStatusMutation.mutate({ status: newStatus });
  };

  const isAvailable = status?.status === "available";
  const statusText = isAvailable ? "Müsait" : "Meşgul";
  const statusColor = isAvailable ? "bg-green-500" : "bg-yellow-500";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!showToggle && <span className="text-sm text-slate-600 hidden sm:inline">Admin Durumu:</span>}
      
      <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1">
        <div className={`w-2 h-2 ${statusColor} rounded-full`}></div>
        <span className="text-sm font-medium text-slate-700">{statusText}</span>
      </div>

      {showToggle && (
        <Button
          onClick={toggleStatus}
          disabled={updateStatusMutation.isPending}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isAvailable 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          {isAvailable ? "Müsait → Meşgul" : "Meşgul → Müsait"}
        </Button>
      )}
    </div>
  );
}
