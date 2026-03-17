import React from 'react';

export default function ShelterAlert({ activeTornadoWarning }) {
  if (!activeTornadoWarning) return null;

  const handleShelter = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const body = encodeURIComponent(`⚠️ TORNADO WARNING ACTIVE. I am safe and sheltering. My location: ${mapsUrl} — sent via YouNeeK Pro Radar`);
      window.open(`sms:?&body=${body}`);
    }, () => {
      const body = encodeURIComponent(`⚠️ TORNADO WARNING ACTIVE. I am safe and sheltering. — sent via YouNeeK Pro Radar`);
      window.open(`sms:?&body=${body}`);
    });
  };

  return (
    <div style={{ position:'fixed', bottom:'30px', left:'50%', transform:'translateX(-50%)', zIndex:9999 }}>
      <button onClick={handleShelter} style={{ backgroundColor:'#00ff44', color:'#000', fontWeight:'bold', fontSize:'18px', padding:'18px 36px', borderRadius:'12px', border:'none', cursor:'pointer', boxShadow:'0 0 30px #00ff44', animation:'pulse 1.5s infinite' }}>
        🟢 I'M SHELTERING — TAP TO ALERT CONTACTS
      </button>
      <style>{`@keyframes pulse { 0%{box-shadow:0 0 20px #00ff44} 50%{box-shadow:0 0 60px #00ff44} 100%{box-shadow:0 0 20px #00ff44} }`}</style>
    </div>
  );
}
09:18 pm