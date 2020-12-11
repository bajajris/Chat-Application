const users = []

//addUser, removeUser, get user, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: "Username is in use"
        }
    }

    const user = { id, username, room }
    users.push(user)

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find(user => {
        return user.id === id
    })
    if(!user){
        return undefined
    }
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter(user => {
        return user.room === room
    })

    return usersInRoom
}

// console.log(getUser(32))
// console.log(getUsersInRoom('ABC'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}