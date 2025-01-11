const socket = io();
const nicknameInput = document.getElementById("nickname")
const messageInput = document.getElementById("message-input")
const sendButton = document.getElementById("send-button")
const messagesDisplay = document.getElementById("messages-display")
const userNames = document.getElementById("user-names")
const leaveButton = document.getElementById("leave")

document.getElementById("message-input-area").style.visibility = "hidden"
let userList = []

function hiddenNickname () {
    const nickname = document.getElementById("nickname").value

    if (nickname.trim() !== "") {
        socket.emit("changeNickname", nickname)
        document.getElementById("nickname-form-hidden").style.display = "none"
        document.getElementById("message-input-area").style.visibility = "visible"
    } else {
        const error = document.getElementById("error-nickname").textContent = "Por favor, digite um apelido."
    }
}

function addUserToList(nickname) {
    const userNamesElement = document.createElement('li')
    userNamesElement.innerHTML = nickname
    userNames.appendChild(userNamesElement)
    userNames.scrollTop = userNames.scrollHeight
}

function displayMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')
    messageElement.innerHTML = message
    messagesDisplay.appendChild(messageElement)
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight
}

function removeUserFromList(nickname) {
    const userListItems = document.querySelectorAll('#user-names li');
    userListItems.forEach(item => {
        if (item.textContent === nickname) {
            item.remove()
        }
    });
}

function sendMessage() {
    const message = messageInput.value;
    if (message.trim() !== "") {
        socket.emit('chat', message);
        messageInput.value = "";
    }
}

function leaveChat() {
    socket.disconnect()
    window.location.reload()
}

function updateUIWithUserList(userList) {
    userNames.innerHTML = ""
    userList.forEach((user) => {
        addUserToList(user)
    });
}

socket.on('connect', () => {
    socket.emit('getExistingUsers')
})

socket.on('existingUsers', (initialUserList) => {
    userList = initialUserList
    updateUIWithUserList(userList)
})

socket.on('existingUsers', (updatedUserList) => {
    userList = updatedUserList
    updateUIWithUserList(userList)
})

sendButton.addEventListener("click", sendMessage)

messageInput.addEventListener("keypress", (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    } else if (event.key === 'Enter' && event.shiftKey) {

    }
})

socket.on('chat', (msg, nickname) => {
    displayMessage(`<span class="username">${nickname}</span> falou: ${msg}`)
})

socket.on('changeNickname', (nickname) => {
    displayMessage(`<span class="username">${nickname} </span>entrou na sala...`)
    addUserToList(nickname)
})

socket.on('userDisconnected', (nickname) => {
    removeUserFromList(nickname)
    displayMessage(`<span class="username">${nickname} </span>saiu da sala...`)
});