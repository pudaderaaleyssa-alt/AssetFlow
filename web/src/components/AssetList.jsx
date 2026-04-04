import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { Search, Trash2 } from "lucide-react";

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Filter by the logged-in user's ID
    const q = query(collection(db, "assets"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assetData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssets(assetData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this asset?")) {
      await deleteDoc(doc(db, "assets", id));
    }
  };

  const filtered = assets.filter(a => 
    a.Asset_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading your assets...</p>;

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search assets..." 
        style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd" }}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th>Name</th>
            <th>Category</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(asset => (
            <tr key={asset.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "10px" }}>{asset.Asset_Name}</td>
              <td>{asset.Category}</td>
              <td>${asset.Value}</td>
              <td>
                <button onClick={() => handleDelete(asset.id)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <p>No assets found for your account.</p>}
    </div>
  );
};

export default AssetList;