import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { CardRoomManager } from "./src/online/roomManager";

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
    res.json({ status: "ok", app: "ホンモノカードバトル", time: new Date().toISOString() });
  });

  app.get("/backend-status", (req, res) => {
    res.send("Honmono Card Battle Backend is Running");
  });

  // Card Room Manager instance
  const cardRoomManager = new CardRoomManager(io);

  io.on("connection", (socket) => {
    console.log(`[Socket Connected] id: ${socket.id}`);

    // Quick match (Random matchmaking)
    socket.on("card_quick_match", ({ player }) => {
      console.log(`[Quick Match Request] ${player?.name} (${player?.id})`);
      cardRoomManager.handleQuickMatch(socket, player);
    });

    // Cancel match search
    socket.on("card_cancel_match", () => {
      cardRoomManager.cancelMatch(socket.id);
    });

    // Create Friend Room
    socket.on("card_create_friend_room", ({ player }) => {
      console.log(`[Create Friend Room] by ${player?.name}`);
      cardRoomManager.createFriendRoom(socket, player);
    });

    // Join Friend Room
    socket.on("card_join_friend_room", ({ inviteCode, player }) => {
      console.log(`[Join Friend Room] Code: ${inviteCode} by ${player?.name}`);
      cardRoomManager.joinFriendRoom(socket, inviteCode, player);
    });

    // Solo CPU match
    socket.on("card_solo_match", ({ player }) => {
      console.log(`[Solo CPU Match] by ${player?.name}`);
      cardRoomManager.startSoloBotMatch(socket, player);
    });

    // Game action
    socket.on("card_action", ({ roomId, playerId, payload }) => {
      cardRoomManager.handleCardAction(socket, roomId, playerId, payload);
    });

    // Rejoin match
    socket.on("card_rejoin_match", ({ roomId, playerId }) => {
      cardRoomManager.rejoinMatch(socket, roomId, playerId);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket Disconnected] id: ${socket.id}`);
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
