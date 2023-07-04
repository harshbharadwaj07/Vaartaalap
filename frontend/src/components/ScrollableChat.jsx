import { useContext } from "react";
import { UserContext } from "../App";
import ScrollableFeed from "react-scrollable-feed";

const ScrollableChat = ({ messages }) => {
  const { selectChat } = useContext(UserContext);

  function isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function newLine(props) {
    const text = props;
    const newText = text.split("\n").map((str, index) => (
      <span key={index}>
        {str}
        <br />
      </span>
    ));
    return newText;
  }

  return (
    <ScrollableFeed>
      {messages.map((msg, index) => {
        const date = new Date(msg.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const isDifferentDate =
          index === 0 || !isSameDate(date, new Date(messages[index - 1].createdAt));

        return (
          <div key={msg._id}>
            {isDifferentDate && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "gray",
                }}
              >
                {day}-{month}-{year}
              </div>
            )}

            {msg.sender.username === localStorage.getItem("username") ? (
              <div
                className="w-100"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                }}
              >
                <div
                  className="d-inline-flex"
                  style={{
                    backgroundColor: "#38B2AC",
                    borderRadius: "15px",
                    margin: "5px",
                    marginRight: "20px",
                    padding: "8px",
                    overflowY: "auto",
                    maxWidth: "75%",
                    position: "relative",
                  }}
                >
                  <div style={{ marginRight: "40px" }}>{newLine(msg.body)}</div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "5px",
                      fontSize: "10px",
                      color: "#fff",
                      padding: "2px 2px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "5px",
                    }}
                  >
                    {hours}:{minutes}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {selectChat.GrpChat && (
                  <img
                    style={{
                      borderRadius: "50%",
                      width: "35px",
                      height: "35px",
                    }}
                    src={msg.sender.pic}
                    alt={msg.sender.name}
                  />
                )}
                <div
                  className="d-inline-flex"
                  style={{
                    backgroundColor: "#2BA8F0",
                    borderRadius: "15px",
                    margin: "5px",
                    padding: "8px",
                    overflowY: "auto",
                    maxWidth: "75%",
                    position: "relative",
                  }}
                >
                  {selectChat.GrpChat && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", alignItems: "center", marginBottom: "8px", marginRight: "40px" }}>
                      <span style={{ fontWeight: "bold", marginRight: "8px" }}>{msg.sender.name}</span>
                      <div style={{ marginLeft: "8px" }}>{newLine(msg.body)}</div>
                    </div>
                  )}

                  
                  {!selectChat.GrpChat && <div style={{ marginRight: "40px" }}>{newLine(msg.body)}</div>}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "5px",
                      fontSize: "10px",
                      color: "#fff",
                      padding: "2px 2px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "5px",
                    }}
                  >
                    {hours}:{minutes}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
