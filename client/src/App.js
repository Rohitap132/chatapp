import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import WordByWordDisplay from "./WordByWordDisplay";

const socket = io.connect("http://localhost:3001");//making connection request to socket.io server side

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [readWelcome, setReadWelcome] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      setReadWelcome(true); // Set the state to trigger text-to-speech
      fetch("http://localhost:3001/api/join-room", {//route accessed use of post method
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data); // checking if the data is sent on console
          socket.emit("join_room",room);
          setShowChat(true);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      setErrorMessage("Please enter both username and room ID");//error message 
    }
  };

  useEffect(() => {
    if (readWelcome) {
      const welcomeMessage = new SpeechSynthesisUtterance(//for text to speech using speechsynthesis
        `Welcome to ChatterBox. ${username}!`
      );
      const voices = window.speechSynthesis.getVoices();
      welcomeMessage.voice = voices[1];

      window.speechSynthesis.speak(welcomeMessage);//triggering text to speech
      setReadWelcome(false);//reset the variable to avoid looping
    }
  }, [readWelcome, username]);

  return (
    <div className="App">
      {!showChat ? (
        <div>
          <div className="joinChatContainer">
          <h3>Join A Room</h3>
          <input
            type="text"
            placeholder="Name"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Enter the Room id To join"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
            onKeyDown={(event) => {
              event.key === "Enter" && joinRoom();
            }}
          />
          <button onClick={joinRoom}>Join</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          <div className="chat-container">
          <WordByWordDisplay sentence="Welcome to ChatterBox!   Have a great time." delay={500} />
          </div>
        </div>
      ) : (
           <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;

