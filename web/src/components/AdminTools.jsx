import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Megaphone, Send, AlertCircle } from "lucide-react";

const AdminTools = () => {
  const [announcement, setAnnouncement] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      // Create a record in Firestore. 
      // Your Python backend should watch this collection to trigger FCM.
      await addDoc(collection(db, "announcements"), {
        content: announcement,
        senderEmail: auth.currentUser.email,
        senderUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        target: "all", // You could later change this to "workers" or "viewers"
      });

      setStatus({ type: "success", msg: "Announcement saved! Triggering notifications..." });
      setAnnouncement("");
    } catch (error) {
      console.error("Error sending announcement:", error);
      setStatus({ type: "error", msg: "Failed to save announcement. Check permissions." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Megaphone size={24} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: "20px" }}>Admin Announcements</h2>
      </div>

      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
        Write a message below to send a push notification to all Workers and Viewers.
      </p>

      <form onSubmit={handleSendAnnouncement}>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter announcement details (e.g., 'System maintenance at 5 PM')..."
          style={textareaStyle}
          rows="4"
          disabled={loading}
        />

        {status.msg && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            color: status.type === "success" ? "#10b981" : "#ef4444",
            fontSize: "14px",
            marginBottom: "15px"
          }}>
            <AlertCircle size={16} />
            {status.msg}
          </div>
        )}

        <button 
          type="submit" 
          style={loading ? disabledButtonStyle : buttonStyle}
          disabled={loading || !announcement.trim()}
        >
          {loading ? "Processing..." : (
            <>
              <Send size={18} /> Send Broadcast
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- Styles ---
const containerStyle = {
  background: "#f8fafc",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginTop: "20px"
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px"
};

const textareaStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  fontFamily: "inherit",
  marginBottom: "15px",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box"
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  background: "#3b82f6",
  color: "white",
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  width: "100%",
  transition: "background 0.2s"
};

const disabledButtonStyle = {
  ...buttonStyle,
  background: "#94a3b8",
  cursor: "not-allowed"
};

export default AdminTools;