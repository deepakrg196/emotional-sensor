import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { addMood } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import SongPlayer from './SongPlayer.jsx';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export default function WebcamEmotion() {
  const { user } = useAuth();
  const [emotion, setEmotion] = useState('neutral');
  const [note, setNote] = useState('');
  const [camError, setCamError] = useState('');
  const [active, setActive] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(0);

  async function ensureModels() {
    if (modelsReady) return true;
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsReady(true);
      return true;
    } catch (e) {
      setCamError('Failed to load ML models. Please check your connection.');
      return false;
    }
  }

  async function startCamera() {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      streamRef.current = stream;
      setActive(true);
      const ok = await ensureModels();
      if (ok) startDetectLoop();
    } catch (err) {
      setCamError(err?.message || 'Unable to access camera');
      setActive(false);
    }
  }

  function stopCamera() {
    cancelDetectLoop();
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('moodsense:emotion-changed', { detail: { emotion } })); } catch {}
  }, [emotion]);

  function applyTheme(e) {
    const root = document.documentElement;
    const bgByEmotion = {
      happy: '#D4AF37',     // golden
      sad: '#1e3a8a',       // bright dark blue
      angry: '#8B0000',     // dark red
      surprised: '#FFFF00', // yellow
      neutral: '#D1D5DB'    // grey
    };
    const bg = bgByEmotion[e] || bgByEmotion.neutral;
    try { root.style.setProperty('--bg', bg); } catch {}
  }

  function startDetectLoop() {
    if (!videoRef.current) return;

    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        loopRef.current = window.requestAnimationFrame(tick);
        return;
      }
      try {
        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
          .withFaceExpressions();
        if (result && result.expressions) {
          const entries = Object.entries(result.expressions);
          const allowed = new Set(['happy','sad','neutral','angry','surprised']);
          const filtered = entries.filter(([k]) => allowed.has(k)).sort((a,b) => b[1] - a[1]);
          const [top, prob] = filtered[0] || [];
          const mapped = mapExpression(top);
          if (mapped && prob >= 0.5) {
            setEmotion(prev => (prev === mapped ? prev : mapped));
            applyTheme(mapped);
          }
        }
      } catch {}
      loopRef.current = window.requestAnimationFrame(tick);
    };

    cancelDetectLoop();
    loopRef.current = window.requestAnimationFrame(tick);
  }

  function cancelDetectLoop() {
    if (loopRef.current) {
      window.cancelAnimationFrame(loopRef.current);
      loopRef.current = 0;
    }
  }

  function mapExpression(expr) {
    if (!expr) return null;
    if (expr === 'happy') return 'happy';
    if (expr === 'sad') return 'sad';
    if (expr === 'neutral') return 'neutral';
    if (expr === 'angry') return 'angry';
    if (expr === 'surprised') return 'surprised';
    return null;
  }

  function saveMood() {
    if (!user?.email) return;
    addMood({ email: user.email, mood: emotion, note });
    try { window.dispatchEvent(new Event('moodsense:history-updated')); } catch {}
    setNote('');
  }

  return (
    <div className="panel webcam-card">
      <h2 className="panel-title">Live emotion</h2>
      <div className="camera-row">
        <div className="video-wrap">
          <video ref={videoRef} className="video unmirrored" autoPlay muted playsInline />
        </div>
        <div className="reading">
          <div className={`gauge mood-${emotion}`}>
            <span className="gauge-label">{emotion}</span>
          </div>
          <div className="legend" />
          <div className="camera-toggle-row">
            {!active ? (
              <button className="btn" type="button" onClick={startCamera}>Start camera</button>
            ) : (
              <button className="btn" type="button" onClick={stopCamera}>Stop camera</button>
            )}
          </div>
          {camError ? <p className="error" role="alert">{camError}</p> : null}
          <label className="form-label">
            <span>Note (optional)</span>
            <textarea className="input" rows="3" value={note} onChange={e => setNote(e.target.value)} />
          </label>
          <div className="actions">
            <button className="btn primary" type="button" onClick={saveMood}>Save mood</button>
          </div>
        </div>
      </div>
      <SongPlayer emotion={emotion} />
    </div>
  );
}
