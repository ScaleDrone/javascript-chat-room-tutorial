const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
};

const CLIENT_ID = 'G3TYvCzoXtrIuEtQ';
//const CLIENT_ID = '2BQI1Uc8yaEAnupY';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getRandomName(),
    color: getRandomColor(),
  }
});

let members = [];

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
  });

  room.on('members', m => {
    members = m;
    updateMembersCountDOM();
    updateMembersListDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersCountDOM();
    updateMembersListDOM();
  });

  room.on('member_leave', ({id}) => {
    const index = members.findIndex(m => m.id === id);
    members.splice(index, 1);
    updateMembersCountDOM();
    updateMembersListDOM();
  });

  room.on('data', (text, {id}) => {
    addMessageToListDOM(id, text);
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

function getRandomName() {
  const adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long", "late", "lingering", "bold", "little", "morning", "muddy", "old", "red", "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering", "withered", "wild", "black", "young", "holy", "solitary", "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine", "polished", "ancient", "purple", "lively", "nameless"];
  const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass", "haze", "mountain", "night", "pond", "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower", "wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog", "smoke", "star"];
  const rnd = Math.floor(Math.random() * Math.pow(2, 12));
  return adjs[rnd >> 6 % 64] + "_" + nouns[rnd % 64];
}

function getRandomColor() {
  return '#' + Math.floor(Math.random()*0xFFFFFF).toString(16);
}

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return false;
  }
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: value,
  });
  return false; // To prevent page refresh
}
sendMessage(); // to prevent ESLint error..

function findMember(id) {
  return members.find(m => m.id === id);
}

//------------- DOM STUFF

function updateMembersCountDOM() {
  DOM.membersCount.innerText = `${members.length} users in room`;
}

function createMemberElement(member) {
  const { name, color } = member.clientData;
  return `<div class='member' style='color: ${color}'>${name}</div>`;
}

function updateMembersListDOM() {
  DOM.membersList.innerHTML = members.map(createMemberElement).join('');
}

function createMessageElement(text) {
  return `<div class='message'>${text}</div>`;
}

function addMessageToListDOM(id, text) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.innerHTML += createMemberElement(findMember(id));
  el.innerHTML += createMessageElement(text);
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
