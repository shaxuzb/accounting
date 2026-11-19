import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";

export interface NotificationItem {
  id: number;
  typeId: number;
  /** info, success, warning, error, tax, news, health, doc_approved, payment_due */
  typeCode: string;
  typeName: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdDate: string;
}

export interface NotificationList {
  items: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

export interface NotificationType {
  id: number;
  code: string;
  name: string;
}

export interface NotificationFilter {
  page: number;
  pageSize: number;
  isRead?: boolean;
  typeId?: number;
}

// the bell shows the organization the user has open (and the platform's notices): its key carries it
export const notificationKeys = {
  all: ["notifications"] as const,
  unread: (orgId: number) => ["notifications", "unread-count", orgId] as const,
  list: (filter: NotificationFilter, orgId: number) => ["notifications", "list", orgId, filter] as const,
  types: ["notifications", "types"] as const,
};

export const useUnreadNotificationCount = () => {
  const orgId = useAppSelector((state) => state.organization.id);
  return useQuery({
    queryKey: notificationKeys.unread(orgId),
    // the server answers { count }
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<{ count?: number } | number>("/notifications/unread-count");
      return typeof data === "number" ? data : Number(data?.count ?? 0);
    },
    refetchInterval: 60000,
    retry: false,
  });
};

export const useNotifications = (filter: NotificationFilter, enabled = true) => {
  const orgId = useAppSelector((state) => state.organization.id);
  return useQuery({
    queryKey: notificationKeys.list(filter, orgId),
    queryFn: async () =>
      (await $axiosPrivate.get<NotificationList>("/notifications", { params: filter })).data,
    enabled,
    retry: false,
  });
};

export const useNotificationTypes = () =>
  useQuery({
    queryKey: notificationKeys.types,
    queryFn: async () => (await $axiosPrivate.get<NotificationType[]>("/notifications/types")).data,
    staleTime: 60 * 60 * 1000,
  });

const useRefresh = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
};

export const useMarkNotificationRead = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => $axiosPrivate.post(`/notifications/${id}/read`),
    onSettled: refresh,
  });
};

export const useMarkAllNotificationsRead = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => $axiosPrivate.post("/notifications/read-all"),
    onSettled: refresh,
  });
};
