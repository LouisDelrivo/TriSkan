import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════
   ZONES DATA — matching the Intermarché plan
   ═══════════════════════════════════════════ */
const ZONES = {
  A: {
    label: "ZONE A — TRI PRINCIPAL",
    color: "#1B6B3A",
    items: [
      { id: "A1", label: "Carton", icon: "📦", color: "#C49A2A" },
      { id: "A2", label: "Films", icon: "🔄", color: "#D4A72C" },
      { id: "A3", label: "Polyst.", icon: "🥡", color: "#7E57C2" },
      { id: "A4", label: "Papier", icon: "📄", color: "#5C6BC0" },
      { id: "A5", label: "Bio", icon: "🌱", color: "#43A047" },
      { id: "A6", label: "T-V", icon: "🗑️", color: "#757575" },
    ],
  },
  B: {
    label: "ZONE B · 🔒 DANGEREUX",
    color: "#D32F2F",
    items: [
      { id: "B1", label: "Chimiq.", icon: "☠️", color: "#D32F2F" },
      { id: "B2", label: "DEEE", icon: "🔋", color: "#D32F2F" },
      { id: "B3", label: "Huiles", icon: "🛢️", color: "#E65100" },
    ],
  },
  C: {
    label: "ZONE C — COLLECTE CLIENT",
    color: "#7A9A80",
    items: [
      { id: "C1", label: "PET", icon: "🍾", color: "#2196F3" },
      { id: "C2", label: "Verre", icon: "🫙", color: "#00897B" },
      { id: "C3", label: "Lampes", icon: "💡", color: "#FF9800" },
      { id: "C4", label: "Textile", icon: "👕", color: "#AB47BC" },
    ],
  },
  D: {
    label: "ZONE D — LOGISTIQUE",
    color: "#8D6E63",
    items: [
      { id: "D1", label: "Palettes", icon: "🪵", color: "#8D6E63" },
    ],
  },
};

const ALL_ITEMS = Object.values(ZONES).flatMap(z => z.items);
const USERS = ["Marie L.", "Thomas D.", "Sofia R.", "Lucas M.", "Emma B."];

function generateScan(item) {
  const success = Math.random() > 0.12;
  return {
    id: `SCN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    itemId: item.id,
    itemLabel: item.label,
    itemIcon: item.icon,
    itemColor: item.color,
    user: USERS[Math.floor(Math.random() * USERS.length)],
    status: success ? "success" : "error",
    result: success
      ? ["Bac conforme", "Niveau OK", "Trié correctement", "Validé"][Math.floor(Math.random() * 4)]
      : ["Contamination détectée", "Bac plein", "Erreur de tri"][Math.floor(Math.random() * 3)],
    weight: success ? (Math.random() * 120 + 5).toFixed(1) : "—",
    fillLevel: Math.floor(Math.random() * 100),
  };
}

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ═══ BIN COMPONENT (isometric-ish 3D box) ═══ */
function Bin({ item, onScan, scanning, lastScan }) {
  const fill = lastScan?.fillLevel ?? Math.floor(Math.random() * 60 + 15);
  const isScanning = scanning === item.id;

  return (
    <div
      onClick={() => onScan(item)}
      style={{
        position: "relative",
        width: 88,
        cursor: "pointer",
        transition: "transform 0.15s ease",
        transform: isScanning ? "scale(0.94)" : "scale(1)",
      }}
    >
      {/* Pulse ring on scan */}
      {isScanning && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 100, height: 100,
          marginTop: -50, marginLeft: -50,
          borderRadius: "50%",
          border: `3px solid ${item.color}`,
          animation: "pulse 0.6s ease-out forwards",
          zIndex: 10,
        }} />
      )}

      {/* 3D Box */}
      <div style={{
        position: "relative",
        background: `${item.color}12`,
        border: `2px solid ${item.color}`,
        borderRadius: 10,
        padding: "6px 0 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        overflow: "hidden",
      }}>
        {/* Fill level bar (background) */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${fill}%`,
          background: `${item.color}20`,
          transition: "height 0.5s ease",
        }} />

        {/* Badge */}
        <div style={{
          background: item.color,
          borderRadius: "50%",
          width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative", zIndex: 2,
        }}>{item.id}</div>

        {/* Icon */}
        <div style={{ fontSize: 24, position: "relative", zIndex: 2, lineHeight: 1.2 }}>{item.icon}</div>

        {/* Label */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: item.color,
          fontFamily: "'DM Sans', sans-serif",
          position: "relative", zIndex: 2,
        }}>{item.label}</div>

        {/* Fill % */}
        <div style={{
          fontSize: 8, color: item.color, opacity: 0.7,
          fontFamily: "'JetBrains Mono', monospace",
          position: "relative", zIndex: 2,
        }}>{fill}%</div>
      </div>
    </div>
  );
}

/* ═══ ZONE SECTION ═══ */
function ZoneSection({ zoneKey, zone, onScan, scanning, lastScanMap }) {
  const isDanger = zoneKey === "B";
  return (
    <div style={{
      border: `${isDanger ? 2 : 1.5}px ${isDanger ? "solid" : "dashed"} ${zone.color}${isDanger ? "" : "60"}`,
      borderRadius: 12,
      padding: "12px 14px 14px",
      background: isDanger ? `${zone.color}08` : "rgba(255,255,255,0.02)",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: zone.color,
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: 10, textAlign: "center",
        letterSpacing: 0.5,
      }}>{zone.label}</div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        justifyContent: "center",
      }}>
        {zone.items.map(item => (
          <Bin
            key={item.id}
            item={item}
            onScan={onScan}
            scanning={scanning}
            lastScan={lastScanMap[item.id]}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ STAT CARD ═══ */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      padding: "12px 16px",
      flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 9, color: "#7A9A80", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#E8F5E9", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#5a7a60", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
}

/* ═══════════════════
   MAIN APP
   ═══════════════════ */
export default function TriSelectifScanner() {
  const [scans, setScans] = useState([]);
  const [view, setView] = useState("map");
  const [scanning, setScanning] = useState(null);
  const [filterZone, setFilterZone] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [lastScanMap, setLastScanMap] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("intermarche-tri-scans");
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          setScans(parsed);
          const lsm = {};
          parsed.forEach(s => { lsm[s.itemId] = s; });
          setLastScanMap(lsm);
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (data) => {
    try { await window.storage.set("intermarche-tri-scans", JSON.stringify(data)); } catch (e) {}
  }, []);

  const handleScan = useCallback((item) => {
    if (scanning) return;
    setScanning(item.id);
    setTimeout(() => {
      const scan = generateScan(item);
      setScans(prev => {
        const updated = [scan, ...prev];
        save(updated);
        return updated;
      });
      setLastScanMap(prev => ({ ...prev, [item.id]: scan }));
      setToast(scan);
      setTimeout(() => setToast(null), 2800);
      setScanning(null);
    }, 600);
  }, [scanning, save]);

  const handleClear = useCallback(async () => {
    setScans([]);
    setLastScanMap({});
    try { await window.storage.delete("intermarche-tri-scans"); } catch (e) {}
  }, []);

  const filtered = scans.filter(s =>
    (filterZone === "all" || s.itemId.startsWith(filterZone)) &&
    (filterStatus === "all" || s.status === filterStatus)
  );

  const successCount = scans.filter(s => s.status === "success").length;
  const errorCount = scans.filter(s => s.status === "error").length;
  const rate = scans.length > 0 ? ((successCount / scans.length) * 100).toFixed(0) : "—";

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a1a0f", color: "#7A9A80", fontFamily: "'DM Sans', sans-serif" }}>
      Chargement...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #071210 0%, #0a1a0f 40%, #0d1f14 100%)",
      color: "#E8F5E9",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Subtle grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(46,155,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,155,90,0.3) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 100,
          background: toast.status === "success" ? "rgba(27,107,58,0.25)" : "rgba(211,47,47,0.2)",
          border: `1px solid ${toast.status === "success" ? "#2E9B5A" : "#D32F2F"}`,
          borderRadius: 10, padding: "12px 18px",
          backdropFilter: "blur(16px)",
          animation: "slideIn 0.25s ease-out",
          maxWidth: 300,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: toast.status === "success" ? "#4CAF50" : "#EF5350" }}>
            {toast.itemIcon} {toast.status === "success" ? "Scan réussi" : "Erreur"} — {toast.itemId}
          </div>
          <div style={{ fontSize: 11, color: "#A5D6A7", marginTop: 3 }}>{toast.result} · {toast.user}</div>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div style={{
        background: "linear-gradient(135deg, #0D3B1E 0%, #1B6B3A 60%, #2E9B5A 100%)",
        padding: "20px 24px 50px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#fff",
          }}>♻️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Instrument Sans', sans-serif", color: "#fff" }}>
              Plan des zones de tri
            </h1>
          </div>
        </div>
        <div style={{
          textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.7)",
          fontWeight: 500,
        }}>📍 Intermarché Villefranche</div>
      </div>

      {/* Tabs (overlapping header) */}
      <div style={{
        display: "flex", gap: 6, justifyContent: "center",
        marginTop: -24, position: "relative", zIndex: 5, padding: "0 20px",
      }}>
        {[
          { key: "map", label: "🗺️ Zones", },
          { key: "history", label: `📋 Historique${scans.length ? ` (${scans.length})` : ""}` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)} style={{
            padding: "10px 24px", borderRadius: 28, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: view === tab.key ? "#F6FAF7" : "rgba(255,255,255,0.08)",
            color: view === tab.key ? "#1B6B3A" : "rgba(255,255,255,0.7)",
            boxShadow: view === tab.key ? "0 4px 20px rgba(0,0,0,0.25)" : "none",
            transition: "all 0.2s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ padding: "20px 20px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <StatCard label="Scans" value={scans.length} color="#4CAF50" />
        <StatCard label="Réussite" value={`${rate}%`} sub={`${successCount}✓ / ${errorCount}✗`} color="#A5D6A7" />
        <StatCard label="Dernier" value={scans[0] ? scans[0].itemId : "—"} sub={scans[0] ? scans[0].itemLabel : "aucun"} color="#81C784" />
      </div>

      {/* ══ MAP VIEW ══ */}
      {view === "map" && (
        <div style={{ padding: "8px 20px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            textAlign: "center", fontSize: 11, color: "#5a7a60",
            padding: "6px 0", fontStyle: "italic",
          }}>
            Cliquez sur un bac pour simuler un scan
          </div>

          {/* Store layout */}
          <div style={{
            border: "1.5px solid #2a4a30",
            borderRadius: 14,
            padding: 16,
            background: "rgba(255,255,255,0.015)",
          }}>
            {/* Surface de vente (compact) */}
            <div style={{
              border: "1px solid #2a4a30",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 12,
              background: "rgba(46,155,90,0.04)",
            }}>
              <div style={{ fontSize: 8, color: "#5a7a60", fontWeight: 700, textAlign: "center", marginBottom: 6, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Surface de vente
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                {["Épicerie", "Boissons", "DPH", "Conserves", "Surgelés", "Frais"].map(r => (
                  <div key={r} style={{
                    padding: "3px 10px", borderRadius: 4,
                    background: "rgba(184,204,184,0.1)",
                    fontSize: 9, color: "#7A9A80", fontWeight: 500,
                  }}>{r}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "center" }}>
                <div style={{ padding: "4px 12px", borderRadius: 5, background: "rgba(200,230,201,0.08)", border: "1px solid rgba(200,230,201,0.15)", fontSize: 9, color: "#4CAF50" }}>🥦 F&L</div>
                <div style={{ padding: "4px 12px", borderRadius: 5, background: "rgba(239,154,154,0.08)", border: "1px solid rgba(239,154,154,0.15)", fontSize: 9, color: "#EF9A9A" }}>🥩 Boucherie</div>
              </div>
              <div style={{ marginTop: 8, padding: "5px 0", borderRadius: 5, background: "rgba(255,224,130,0.06)", border: "1px solid rgba(255,224,130,0.15)", textAlign: "center", fontSize: 9, color: "#FFE082", fontWeight: 700 }}>
                💳 CAISSES
              </div>
              <div style={{ marginTop: 6, padding: "4px 0", borderRadius: 5, background: "rgba(144,202,249,0.06)", border: "1px solid rgba(144,202,249,0.12)", textAlign: "center", fontSize: 9, color: "#90CAF9" }}>
                🚪 ENTRÉE CLIENT
              </div>
            </div>

            {/* Zone C - Collecte Client */}
            <ZoneSection zoneKey="C" zone={ZONES.C} onScan={handleScan} scanning={scanning} lastScanMap={lastScanMap} />

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0" }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #2a4a30, transparent)" }} />
              <div style={{ fontSize: 8, color: "#5a7a60", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Arrière magasin</div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #2a4a30, transparent)" }} />
            </div>

            {/* Quai */}
            <div style={{
              padding: "6px 0", borderRadius: 5, textAlign: "center",
              background: "rgba(46,155,90,0.04)", border: "1px solid #2a4a30",
              fontSize: 10, color: "#5a7a60", fontWeight: 600, marginBottom: 10,
            }}>🚛 Quai de livraison</div>

            {/* Zone A */}
            <ZoneSection zoneKey="A" zone={ZONES.A} onScan={handleScan} scanning={scanning} lastScanMap={lastScanMap} />

            {/* Presse */}
            <div style={{
              margin: "10px 0", padding: "5px 0", borderRadius: 4,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center", fontSize: 9, color: "#616161",
            }}>⚙️ Presse</div>

            {/* Zone B */}
            <ZoneSection zoneKey="B" zone={ZONES.B} onScan={handleScan} scanning={scanning} lastScanMap={lastScanMap} />

            {/* Zone D */}
            <div style={{ marginTop: 10 }}>
              <ZoneSection zoneKey="D" zone={ZONES.D} onScan={handleScan} scanning={scanning} lastScanMap={lastScanMap} />
            </div>

            {/* Compacteur */}
            <div style={{
              marginTop: 10, padding: "5px 0", borderRadius: 4,
              background: "rgba(46,155,90,0.04)", border: "1px solid #2a4a30",
              textAlign: "center", fontSize: 9, color: "#5a7a60",
            }}>Compacteur</div>
          </div>

          <div style={{
            background: "rgba(232,245,233,0.06)", borderRadius: 8,
            padding: "6px 0", textAlign: "center",
            fontSize: 9, color: "#5a7a60",
          }}>Plan type · Intermarché — à adapter selon votre point de vente</div>
        </div>
      )}

      {/* ══ HISTORY VIEW ══ */}
      {view === "history" && (
        <div style={{ padding: "8px 20px 32px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{
              padding: "7px 12px", borderRadius: 8, fontSize: 12,
              background: "rgba(255,255,255,0.06)", color: "#A5D6A7",
              border: "1px solid rgba(46,155,90,0.2)",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
              <option value="all">Toutes zones</option>
              <option value="A">Zone A — Tri principal</option>
              <option value="B">Zone B — Dangereux</option>
              <option value="C">Zone C — Collecte client</option>
              <option value="D">Zone D — Logistique</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
              padding: "7px 12px", borderRadius: 8, fontSize: 12,
              background: "rgba(255,255,255,0.06)", color: "#A5D6A7",
              border: "1px solid rgba(46,155,90,0.2)",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>
              <option value="all">Tous statuts</option>
              <option value="success">✓ Succès</option>
              <option value="error">✗ Erreur</option>
            </select>
            <div style={{ flex: 1 }} />
            {scans.length > 0 && (
              <button onClick={handleClear} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                background: "rgba(211,47,47,0.1)", color: "#EF5350",
                border: "1px solid rgba(211,47,47,0.2)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}>Effacer tout</button>
            )}
          </div>

          {/* Zone distribution bar */}
          {scans.length > 0 && (
            <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 14, background: "rgba(255,255,255,0.04)" }}>
              {ALL_ITEMS.map(item => {
                const count = scans.filter(s => s.itemId === item.id).length;
                const pct = (count / scans.length) * 100;
                return pct > 0 ? <div key={item.id} style={{ width: `${pct}%`, background: item.color, transition: "width 0.3s" }} title={`${item.id} ${item.label}: ${count}`} /> : null;
              })}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: 50, color: "#3a5a40",
              border: "1px dashed rgba(46,155,90,0.2)", borderRadius: 12,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 13 }}>Aucun scan enregistré</div>
              <div style={{ fontSize: 11, marginTop: 4, color: "#2a4a30" }}>Allez dans Zones et cliquez sur un bac</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {filtered.map((scan, i) => (
                <div key={scan.id} style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(46,155,90,0.1)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${scan.itemColor}`,
                  animation: i === 0 && scans[0]?.id === scan.id ? "fadeIn 0.3s ease-out" : "none",
                }}>
                  <div style={{ fontSize: 20 }}>{scan.itemIcon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{scan.itemId} · {scan.itemLabel}</div>
                    <div style={{ fontSize: 10, color: "#5a7a60", fontFamily: "'JetBrains Mono', monospace" }}>
                      {scan.id} · {scan.user}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: scan.status === "success" ? "#4CAF50" : "#EF5350",
                    background: scan.status === "success" ? "rgba(76,175,80,0.1)" : "rgba(239,83,80,0.1)",
                    padding: "3px 8px", borderRadius: 5,
                    whiteSpace: "nowrap",
                  }}>
                    {scan.status === "success" ? "✓" : "✗"} {scan.result}
                  </div>
                  <div style={{ fontSize: 10, color: "#5a7a60", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", minWidth: 80 }}>
                    {fmt(scan.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        select option { background: #0d1f14; color: #A5D6A7; }
      `}</style>
    </div>
  );
}
