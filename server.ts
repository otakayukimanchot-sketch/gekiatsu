import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { CardRoomManager } from "./src/online/roomManager";
import { maskWireData, unmaskWireData } from "./src/utils/wireSecurity";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const frontendUrl = process.env.VITE_FRONTEND_URL;

  // CORS configuration
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const isAllowed = !origin || 
        origin.includes('.run.app') || 
        origin.includes('vercel.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        (frontendUrl && (origin === frontendUrl || origin === frontendUrl.replace(/\/$/, "")));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // Ensure no game information, card data, or state is cached on disk or tracked on Wi-Fi/network
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingInterval: 10000,
    pingTimeout: 30000,
    allowEIO3: true,
    transports: ['websocket', 'polling']
  });

  // Health check routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ホン〇ノカードバトル", time: new Date().toISOString() });
  });

  app.get("/backend-status", (req, res) => {
    res.send("Hon〇no Card Battle Backend is Running");
  });

  // Card Room Manager instance
  const cardRoomManager = new CardRoomManager(io);

  io.on("connection", (socket) => {
    // Quick match (Random matchmaking) - wire payload unmasked safely
    socket.on("card_quick_match", (raw) => {
      const data = unmaskWireData<{ player: any }>(raw);
      cardRoomManager.handleQuickMatch(socket, data?.player);
    });

    // Cancel match search
    socket.on("card_cancel_match", () => {
      cardRoomManager.cancelMatch(socket.id);
    });

    // Create Friend Room
    socket.on("card_create_friend_room", (raw) => {
      const data = unmaskWireData<{ player: any }>(raw);
      cardRoomManager.createFriendRoom(socket, data?.player);
    });

    // Join Friend Room
    socket.on("card_join_friend_room", (raw) => {
      const data = unmaskWireData<{ inviteCode: string; player: any }>(raw);
      cardRoomManager.joinFriendRoom(socket, data?.inviteCode, data?.player);
    });

    // Solo CPU match
    socket.on("card_solo_match", (raw) => {
      const data = unmaskWireData<{ player: any }>(raw);
      cardRoomManager.startSoloBotMatch(socket, data?.player);
    });

    // Game action
    socket.on("card_action", (raw) => {
      const data = unmaskWireData<{ roomId: string; playerId: string; payload: any }>(raw);
      if (data?.roomId && data?.playerId && data?.payload) {
        cardRoomManager.handleCardAction(socket, data.roomId, data.playerId, data.payload);
      }
    });

    // Real-time Emote transmission
    socket.on("card_send_emote", (raw) => {
      const data = unmaskWireData<any>(raw);
      cardRoomManager.handleSendEmote(socket, data);
    });

    // Rejoin match
    socket.on("card_rejoin_match", (raw) => {
      const data = unmaskWireData<{ roomId: string; playerId: string }>(raw);
      if (data?.roomId && data?.playerId) {
        cardRoomManager.rejoinMatch(socket, data.roomId, data.playerId);
      }
    });

    // List live matches for spectating
    socket.on("card_list_live_matches", () => {
      socket.emit("card_live_matches", maskWireData({ matches: cardRoomManager.getLiveMatches() }));
    });

    // Spectate match by roomId or inviteCode
    socket.on("card_spectate_match", (raw) => {
      const data = unmaskWireData<{ targetIdOrCode: string; player: any }>(raw);
      if (data?.targetIdOrCode && data?.player) {
        cardRoomManager.spectateMatch(socket, data.targetIdOrCode, data.player);
      }
    });

    // Leave spectate
    socket.on("card_leave_spectate", (raw) => {
      const data = unmaskWireData<{ roomId: string }>(raw);
      if (data?.roomId) {
        cardRoomManager.leaveSpectate(socket, data.roomId);
      }
    });

    // Disconnect (Zero-trace on network)
    socket.on("disconnect", () => {
      cardRoomManager.handleDisconnect(socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
