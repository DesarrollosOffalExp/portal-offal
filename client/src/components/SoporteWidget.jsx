import { useState } from 'react';

const EMAIL_SOPORTE = 'tickets@offal.com.ar';

/**
 * Widget flotante de ayuda/soporte (mismo criterio que en las 3 apps).
 * Abre un panel donde el usuario describe el problema y, al enviar, arma un
 * correo (ticket) a soporte con el usuario y la pantalla actuales.
 */
export default function SoporteWidget({ usuario }) {
  const [abierto, setAbierto] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const puedeEnviar = descripcion.trim().length > 0;

  const enviar = () => {
    const asuntoTxt = asunto.trim() ? `[Portal Offal] ${asunto.trim()}` : 'Soporte — Portal Offal';
    const cuerpo =
      `${descripcion.trim()}\n\n` +
      '------------------------------\n' +
      `Enviado por: ${usuario?.nombre || usuario?.email || '(sin datos)'}\n` +
      `Pantalla: ${window.location.href}\n`;
    window.location.href = `mailto:${EMAIL_SOPORTE}?subject=${encodeURIComponent(asuntoTxt)}&body=${encodeURIComponent(cuerpo)}`;
    setAbierto(false);
    setAsunto('');
    setDescripcion('');
  };

  return (
    <div className="soporte">
      {abierto && (
        <div className="soporte-panel" role="dialog" aria-label="Ayuda / Soporte">
          <div className="soporte-head">
            <span className="soporte-titulo">¿Necesitás ayuda?</span>
            <button className="soporte-x" onClick={() => setAbierto(false)} aria-label="Cerrar">✕</button>
          </div>
          <p className="soporte-sub">Contanos el problema y enviamos un ticket a soporte.</p>
          <input
            className="soporte-input"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Asunto (ej: no puedo entrar a una app)"
          />
          <textarea
            className="soporte-input soporte-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Contá qué pasó…"
            rows={3}
          />
          <button className="soporte-enviar" disabled={!puedeEnviar} onClick={enviar}>
            Enviar ticket
          </button>
        </div>
      )}
      <button
        className="soporte-fab"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Ayuda / Soporte"
        title="Ayuda / Soporte"
      >
        {abierto ? '✕' : '?'}
      </button>
    </div>
  );
}
