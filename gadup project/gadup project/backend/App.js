import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [gapUps, setGapUps] = useState([]);
  const [content, setContent] = useState("");
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    // Fetch all GapUps (posts)
    axios.get("http://localhost:5000/gapups").then((response) => {
      setGapUps(response.data);
    });
  }, []);

  const postGapUp = () => {
    axios
      .post("http://localhost:5000/gapups", { userId: user.id, content })
      .then(() => {
        setContent("");
        axios.get("http://localhost:5000/gapups").then((response) => {
          setGapUps(response.data);
        });
      });
  };

  const followUser = (followedId) => {
    axios
      .post("http://localhost:5000/follow", {
        followerId: user.id,
        followedId,
      })
      .then(() => {
        axios.get(`http://localhost:5000/followers/${followedId}`).then((response) => {
          setFollowers(response.data);
        });
      });
  };

  return (
    <Router>
      <div>
        <h1>GapUp: Social Media</h1>
        <div>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />
          <button onClick={postGapUp}>Post</button>
        </div>

        <h2>GapUp Feed</h2>
        {gapUps.map((gapUp) => (
          <div key={gapUp.id}>
            <p>{gapUp.name}: {gapUp.content}</p>
          </div>
        ))}

        <h2>Followers</h2>
        <div>
          {followers.map((follower) => (
            <div key={follower.follower_id}>
              <p>Follower ID: {follower.follower_id}</p>
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;
