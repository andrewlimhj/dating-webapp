// eslint-disable-next-line no-unused-vars
const app = () => {
  // eslint-disable-next-line no-undef
  const socket = io();
  socket.emit('subscribe');

  // todo: declare currentRoom object
  let currentRoom = {};

  // submit form event
  // onsubmit event -> https://www.geeksforgeeks.org/html-dom-onsubmit-event/
  document.getElementById('msg').onsubmit = () => {
    const messageInput = document.getElementById('m');
    const message = messageInput.value;
    const username = document.getElementById('username').value;
    // todo: send back current room
    socket.emit('chatMessage', [message, username, currentRoom]);
    messageInput.value = '';
    return false;
  };

  socket.on('chatMessage', (data) => {
    const sender = Number(data.data[1]);
    console.log('SENDER', sender);

    const userA = data.userDataA;
    console.log('USER A', userA);

    const userB = data.userDataB;
    console.log('USER B', userB);

    const message = data.data[0];

    let senderName;
    let senderPhoto;

    if (sender === userA.id) {
      senderName = userA.first_name;
      senderPhoto = userA.photo_link;
    } else if (sender === userB.id) {
      senderName = userB.first_name;
      senderPhoto = userB.photo_link;
    }

    // DOM manipulation (new)
    const messageList = document.getElementById('messages');

    const newMessage = document.createElement('li');
    newMessage.classList.add('clearfix');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-data');

    if (sender === userA.id) {
      messageDiv.style.textAlign = 'right';
    }

    const avatar = document.createElement('img');
    avatar.src = `/${senderPhoto}`;

    const messageData = document.createElement('span');
    messageData.classList.add('message-data-time');
    messageData.insertAdjacentText('beforeend', `${senderName}`);

    const newMessageDiv = document.createElement('div');

    if (sender === userA.id) {
      newMessageDiv.classList.add('message', 'other-message', 'float-right');
    } else {
      newMessageDiv.classList.add('message', 'my-message');
    }

    newMessageDiv.insertAdjacentText('beforeend', `${message}`);

    messageList.appendChild(newMessage);
    newMessage.appendChild(messageDiv);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageData);
    newMessage.appendChild(newMessageDiv);
  });

  // todo: return data
  socket.on('joinRoom', (data) => {
    console.log('Current Room', currentRoom);
    // eslint-disable-next-line object-curly-newline
    const { chatroom, messages, userDataA, userDataB } = data;
    console.log('MESSAGES', messages);
    console.log('CHAT ROOM', chatroom);

    // console.log('USER ID', userId);
    // console.log('User A', userDataA);
    // console.log('ID', id);
    // console.log('User B', userDataB);

    let senderName;

    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';
    // todo: display chat history
    messages.forEach((message) => {
      const senderId = Number(message.sender);
      const getMessage = message.message;
      // console.log(typeof senderId);

      const newMessage = document.createElement('li');
      newMessage.classList.add('clearfix');

      if (senderId === userDataA.id) {
        senderName = userDataA.first_name;
      } else if (senderId === userDataB.id) {
        senderName = userDataB.first_name;
      }

      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message-data');

      if (senderId === userDataA.id) {
        messageDiv.style.textAlign = 'right';
      }

      const avatar = document.createElement('img');
      if (senderId === userDataA.id) {
        avatar.src = `/${userDataA.photo_link}`;
      } else if (senderId === userDataB.id) {
        avatar.src = `/${userDataB.photo_link}`;
      }

      const messageData = document.createElement('span');
      messageData.classList.add('message-data-time');
      messageData.insertAdjacentText('beforeend', `${senderName}`);

      const newMessageDiv = document.createElement('div');
      if (senderId === userDataA.id) {
        newMessageDiv.classList.add('message', 'other-message', 'float-right');
      } else {
        newMessageDiv.classList.add('message', 'my-message');
      }

      newMessageDiv.insertAdjacentText('beforeend', `${getMessage}`);

      messageList.appendChild(newMessage);
      newMessage.appendChild(messageDiv);

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(messageData);
      newMessage.appendChild(newMessageDiv);
    });

    currentRoom = chatroom;
  });
};
