import React, { useState, useEffect } from "react";
import api, {
  setAuthToken,
  clearAuthData,
  getAuthToken,
} from "./api/axiosConfig";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setTokenState] = useState("");
  const [resourceId, setResourceId] = useState("1");
  const [userData, setUserData] = useState({
    name: "Test Kullanıcı",
    email: "test@example.com",
    age: 30,
  });

  useEffect(() => {
    const currentToken = getAuthToken();
    setTokenState(currentToken || "");
  }, []);

  const handleSetToken = () => {
    if (token.trim()) {
      setAuthToken(token.trim());
      alert("Token ayarlandı!");
    }
  };

  const handleClearToken = () => {
    clearAuthData();
    setTokenState("");
    setData(null);
    setError(null);
    alert("Token ve oturum temizlendi!");
  };

  // GET İsteği - Şifreli Query
  const sendGetRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const queryParams = {
        search: "test data",
        category: "technology",
        page: 1,
        limit: 10,
        sort: "name",
      };

      const response = await api.get("/data", { params: queryParams });
      setData(response.data);
    } catch (err) {
      setError(err.message || "GET isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  // POST İsteği - Şifreli Body
  const sendPostRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const postData = {
        action: "create",
        user: userData,
      };

      const response = await api.post("/data", postData);
      setData(response.data);
    } catch (err) {
      setError(err.message || "POST isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  // PUT İsteği - Şifreli Body
  const sendPutRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const putData = {
        action: "update",
        id: resourceId,
        user: {
          ...userData,
          updatedAt: new Date().toISOString(),
        },
        changes: {
          name: userData.name,
          email: userData.email,
        },
      };

      const response = await api.put(`/data`, putData);
      setData(response.data);
    } catch (err) {
      setError(err.message || "PUT isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  // PATCH İsteği - Şifreli Body
  const sendPatchRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const patchData = {
        action: "partial-update",
        id: resourceId,
        updates: {
          age: userData.age,
          lastModified: new Date().toISOString(),
        },
      };

      const response = await api.patch(`/data`, patchData);
      setData(response.data);
    } catch (err) {
      setError(err.message || "PATCH isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  // DELETE İsteği - Şifreli Body
  const sendDeleteRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const deleteData = {
        action: "delete",
        id: resourceId,
        reason: "test deletion",
        confirmed: true,
      };

      // Axios'ta DELETE isteği için body'yi 'data' alanı ile göndeririz.
      const response = await api.delete(`/data`, {
        data: deleteData,
      });
      setData(response.data);
    } catch (err) {
      setError(err.message || "DELETE isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  // OPTIONS İsteği
  const sendOptionsRequest = async () => {
    if (!getAuthToken()) {
      alert("Önce bir JWT token ayarlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await api.options("/data");
      setData({
        status: response.status,
        headers: response.headers,
        allowedMethods: response.headers["allow"],
      });
    } catch (err) {
      setError(err.message || "OPTIONS isteği başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🔒 Güvenli API İstemcisi - Tüm HTTP Metodları</h1>

      {/* Token Yönetimi */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <h3>🔑 Kimlik Doğrulama</h3>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={token}
            onChange={(e) => setTokenState(e.target.value)}
            placeholder="JWT Token girin"
            style={{
              width: "400px",
              padding: "8px",
              marginRight: "10px",
              border: "1px solid #ddd",
              borderRadius: "3px",
            }}
          />
          <button
            onClick={handleSetToken}
            style={{
              padding: "8px 15px",
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Token Ayarla
          </button>
          <button
            onClick={handleClearToken}
            style={{
              padding: "8px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Veri Girişi */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <h3>📝 Test Verileri</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <div>
            <label>Resource ID:</label>
            <input
              type="text"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
              }}
            />
          </div>
          <div>
            <label>İsim:</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
              }}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
              }}
            />
          </div>
          <div>
            <label>Yaş:</label>
            <input
              type="number"
              value={userData.age}
              onChange={(e) =>
                setUserData({ ...userData, age: parseInt(e.target.value) || 0 })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "3px",
              }}
            />
          </div>
        </div>
      </div>

      {/* HTTP Metod Butonları */}
      <div style={{ marginBottom: "20px" }}>
        <h3>🌐 HTTP Metodları</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          <button
            onClick={sendGetRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "🔍 GET"}
          </button>
          <button
            onClick={sendPostRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "📨 POST"}
          </button>
          <button
            onClick={sendPutRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "✏️ PUT"}
          </button>
          <button
            onClick={sendPatchRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "🔄 PATCH"}
          </button>
          <button
            onClick={sendDeleteRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "🗑️ DELETE"}
          </button>
          <button
            onClick={sendOptionsRequest}
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "⚙️ OPTIONS"}
          </button>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Sonuçlar */}
      {data && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "5px",
          }}
        >
          <h3>📋 Sunucu Yanıtı:</h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "14px",
              maxHeight: "500px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Açıklama */}
      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
        <h4>🎯 Özellikler:</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <h5>🔐 GET Metodu</h5>
            <ul>
              <li>Query parametreleri şifrelenir</li>
              <li>URL'de encrypted parametresi taşınır</li>
              <li>Güvenli arama ve filtreleme</li>
              <li>Replay attack koruması</li>
            </ul>
          </div>
          <div>
            <h5>📨 POST/PUT/PATCH</h5>
            <ul>
              <li>Request body şifrelenir</li>
              <li>Content-Type: text/plain</li>
              <li>Tam veri güvenliği</li>
              <li>Timestamp ve nonce koruması</li>
            </ul>
          </div>
          <div>
            <h5>🗑️ DELETE Metodu</h5>
            <ul>
              <li>Silme parametreleri şifrelenir</li>
              <li>Güvenli silme işlemleri</li>
              <li>Doğrulama verileri korunur</li>
            </ul>
          </div>
          <div>
            <h5>⚙️ OPTIONS Metodu</h5>
            <ul>
              <li>CORS bilgileri</li>
              <li>Desteklenen metodlar</li>
              <li>Sunucu yetenekleri</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
