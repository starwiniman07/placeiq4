const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const activeRooms = {}; // Track participants in rooms

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 1-on-1 Interview Room Handling
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        if (!activeRooms[roomId]) activeRooms[roomId] = [];
        activeRooms[roomId].push(socket.id);
        
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        // Notify others in room
        socket.to(roomId).emit('user-connected', socket.id);

        // Send existing users to the new user
        const otherUsers = activeRooms[roomId].filter(id => id !== socket.id);
        if (otherUsers.length > 0) {
            socket.emit('other-users', otherUsers);
        }
    });

    // Group Chat / Community Discussion
    socket.on('join-community', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined community room ${room}`);
    });

    socket.on('send-message', (payload) => {
        // payload: { room, sender, text, timestamp }
        io.to(payload.room).emit('new-message', payload);
    });

    // WebRTC Signaling
    socket.on('offer', (payload) => {
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (incoming) => {
        io.to(incoming.target).emit('ice-candidate', incoming);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up activeRooms
        for (const roomId in activeRooms) {
            activeRooms[roomId] = activeRooms[roomId].filter(id => id !== socket.id);
            socket.to(roomId).emit('user-disconnected', socket.id);
        }
    });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
    console.log(`Socket.IO signaling server running on port ${PORT}`);
});
