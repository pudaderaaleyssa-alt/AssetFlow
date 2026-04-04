import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");

  const handleUpload = async () => {
    if (!file) return;
    const user = auth.currentUser;
    if (!user) return alert("Please log in first");

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.uid); // Send the ID

    try {
      await axios.post("http://localhost:8000/upload", formData);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px dashed #cbd5e1", borderRadius: "12px" }}>
      <h3>Bulk Import Assets</h3>
      <input type="file" accept=".csv, .xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
      <button 
        onClick={handleUpload} 
        disabled={!file || status === "uploading"}
        style={{ marginLeft: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        {status === "uploading" ? "Uploading..." : "Start Import"}
      </button>

      {status === "success" && <p style={{ color: "green" }}><CheckCircle size={16} /> Done!</p>}
    </div>
  );
};

export default FileUpload;