const express = require('express')
const http = require('http')
const path = require('path')
const { Server } = require("socket.io")
const port = 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

function sortConnectedUsersByNickname(connectedUsers) {
    const entries = Array.from(connectedUsers.entries())
    entries.sort((a, b) => a[1].localeCompare(b[1]))
    
    return new Map(entries)
}

const connectedUsers = new Map()

io.on('connection', (socket) => {

    console.log(`Um usuário com o id ${socket.id} conectou ao servidor`)
    
    socket.on('changeNickname', (nickname) => {
        socket.data.nickname = nickname
        connectedUsers.set(socket.id, nickname)
        io.emit('changeNickname', nickname)
        const sortedUserList = sortConnectedUsersByNickname(connectedUsers)
        io.emit('existingUsers', Array.from(sortedUserList.values()))
        console.log("connecteds", connectedUsers)
    });

    socket.on('getExistingUsers', () => {
        const sortedUsers = sortConnectedUsersByNickname(connectedUsers)
        const userList = Array.from(sortedUsers.values())
        socket.emit('existingUsers', userList)
    });

    socket.on('chat', (msg) => {
        io.emit('chat', msg, socket.data.nickname)
    });

    socket.on('disconnect', () => {
        const disconnectedNickname = connectedUsers.get(socket.id)
        connectedUsers.delete(socket.id)
        if (disconnectedNickname) {
            io.emit('userDisconnected', disconnectedNickname)
        }
        console.log("desconnecteds", connectedUsers)
    });

});

server.listen(port, () => {
    console.log(`Servidor rodando...`)
})