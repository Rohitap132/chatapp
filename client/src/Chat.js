import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedImage, setSelectedFile] = useState(null);
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "" || selectedImage) {
      let imageBlob = null;
  
      if (selectedImage) {
        // Convert the selected image to blob
        imageBlob = await convertImageToBlob(selectedImage);
      }
  
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,  // Include text message
        file: imageBlob ? await convertBlobToBase64(imageBlob) : null,// Converting Blob to Data URL if an image is present
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
  
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setSelectedFile(null);
    }
  };
  

  const convertImageToBlob = async (image) => {
    try {
      const response = await fetch(URL.createObjectURL(image));
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error converting image to blob:", error);
      return null;
    }
  };

  const convertBlobToBase64 = async (blob) => {
    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting blob to base64:", error);
      return null;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  useEffect(() => {
    const handleReceiveMessage = async (data) => {
      if (data.file) {
        // Convert Data URL back to Blob
        const imageBlob = await convertBase64ToBlob(data.file);
        data.file = URL.createObjectURL(imageBlob);
      }

      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const convertBase64ToBlob = async (base64) => {
    const response = await fetch(base64);
    const blob = await response.blob();
    return blob;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Welcome To ChatRoom</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    {messageContent.message && <p>{messageContent.message}</p>}
                    {messageContent.file && (
                      <img
                        src={messageContent.file}
                        alt="sent_image"
                        className="sent-image"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                    )}
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type Here--"
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <label htmlFor="fileInput" className="file-label">
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            accept=".jpg, .jpeg, .png"
            style={{ display: "none" }}
          />
          <span className="plus-symbol">&#43;</span>
        </label>
        <button onClick={sendMessage} className="button1">&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
