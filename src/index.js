const path = require('path')
const http = require('http')//added for socket
const express = require('express')
const socketio = require('socket.io');
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const app = express()
const server = http.createServer(app)//added for socket
const io = socketio(server)
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(express.json())

io.on('connection', (socket) => {
    console.log("New websocket connection")

    socket.on('join', (options, callback)=>{
        
        const {error, user} = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('ADMIN','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('ADMIN',`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect', ()=>{ 
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('ADMIN',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        const locationUrl = `https://google.com/maps?q=${location.latitude},${location.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, locationUrl))
        callback('Location shared')
    })
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})