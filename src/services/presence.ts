import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";

/**
 * The socket every signed-in page keeps open: while it is, the user counts as online. The
 * server tells those who may see users' activity when someone comes online or goes offline.
 */
export interface PresenceChange {
  userId: number;
  online: boolean;
}

const hubUrl = import.meta.env.VITE_API_BASE_URL_PATH + "/hubs/presence";

let connection: HubConnection | null = null;
let connectionToken: string | null = null;
const listeners = new Set<(change: PresenceChange) => void>();

export const startPresence = (token: string) => {
  if (connection && connectionToken === token) return;
  void stopPresence();

  connectionToken = token;
  const current = new HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => token, withCredentials: false })
    // keep trying while the page is open: a restart of the server or a dropped network
    // must not leave the user offline for the rest of the day
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (context) =>
        [0, 2000, 5000, 10000][context.previousRetryCount] ?? 30000,
    })
    .configureLogging(LogLevel.None)
    .build();

  current.on("presence", (change: PresenceChange) =>
    listeners.forEach((listener) => listener(change)),
  );
  // a start that failed (server down) is tried again later, like a dropped connection
  current.onclose(() => {
    if (connection === current) window.setTimeout(() => void begin(current), 30000);
  });

  connection = current;
  void begin(current);
};

const begin = async (current: HubConnection) => {
  if (connection !== current || current.state !== HubConnectionState.Disconnected) return;
  try {
    await current.start();
  } catch {
    if (connection === current) window.setTimeout(() => void begin(current), 30000);
  }
};

export const stopPresence = async () => {
  const current = connection;
  connection = null;
  connectionToken = null;
  if (current) await current.stop().catch(() => undefined);
};

export const onPresenceChange = (listener: (change: PresenceChange) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
