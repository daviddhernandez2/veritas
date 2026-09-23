import { useEffect, useRef, useState } from 'react';
import { colors, radii, shadows, spacing } from '../styles/tokens.js';

const DRAG_CLOSE_THRESHOLD = 90;

// Bottom sheet genérico: backdrop, arrastre del handle para cerrar,
// foco atrapado, respeta safe-area inferior. Usado por Sunburst.jsx
// (preview de post), TreeView.jsx ("Nodo seleccionado" en móvil) y
// ComoFuncionaPage.jsx/AdminDocsPage.jsx (selector de sección).
export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const dragState = useRef({ dragging: false, startY: 0 });

  // Foco atrapado: guarda qué tenía el foco al abrir, lo mueve al
  // sheet, lo restaura al cerrar. Tab/Shift+Tab quedan cíclicos dentro
  // mientras está abierto.
  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement;
    sheetRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setDragY(0);
  }, [isOpen]);

  if (!isOpen) return null;

  function onPointerDown(e) {
    dragState.current = { dragging: true, startY: e.clientY };
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ver mismo motivo en TreeView.jsx — no debe cortar el arrastre.
    }
  }

  function onPointerMove(e) {
    if (!dragState.current.dragging) return;
    const delta = e.clientY - dragState.current.startY;
    setDragY(Math.max(0, delta));
  }

  function onPointerUp() {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    if (dragY > DRAG_CLOSE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(1,4,9,0.6)',
        display: 'flex',
        alignItems: 'flex-end'
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80dvh',
          overflowY: 'auto',
          background: colors.surface.panel,
          border: `1px solid ${colors.border.default}`,
          borderBottom: 'none',
          borderRadius: `${radii.md * 2}px ${radii.md * 2}px 0 0`,
          boxShadow: shadows.modal,
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: `translateY(${dragY}px)`,
          transition: dragState.current.dragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ display: 'flex', justifyContent: 'center', padding: `${spacing.sm}px 0`, cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 36, height: 4, borderRadius: radii.pill, background: colors.border.default }} />
        </div>
        {title && (
          <div style={{ padding: `0 ${spacing.lg}px ${spacing.sm}px`, fontSize: 15, fontWeight: 600, color: colors.text.primary }}>{title}</div>
        )}
        <div style={{ padding: `0 ${spacing.lg}px ${spacing.lg}px` }}>{children}</div>
      </div>
    </div>
  );
}
