import {
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  applySavedWindowPosition,
  clampModalPosition,
  currentModalPosition,
  placeModalAt,
  writeWindowPosition,
} from "../modalWindowPosition";
import type { OverlayChrome } from "./overlayChrome";

type ModalLayerProps = {
  chrome: OverlayChrome;
  modalRef: RefObject<HTMLDivElement | null>;
  onDismiss: () => void;
  children: ReactNode;
};

export function ModalLayer(props: ModalLayerProps) {
  const dragPointerIdRef = useRef<number | null>(null);
  const dragOffsetXRef = useRef(0);
  const dragOffsetYRef = useRef(0);
  const dragHandleRef = useRef<HTMLElement | null>(null);

  function stopModalDrag(): void {
    const modal = props.modalRef.current;
    const dragPointerId = dragPointerIdRef.current;
    if (!modal || dragPointerId === null) {
      return;
    }

    const dragHandle = dragHandleRef.current;
    if (dragHandle?.hasPointerCapture(dragPointerId)) {
      dragHandle.releasePointerCapture(dragPointerId);
    }

    const windowKey = modal.dataset.windowKey;
    if (windowKey) {
      const clamped = clampModalPosition(modal, currentModalPosition(modal));
      placeModalAt(modal, clamped);
      writeWindowPosition(windowKey, clamped);
    }

    dragPointerIdRef.current = null;
    dragHandleRef.current = null;
    modal.classList.remove("is-dragging");
    document.body.classList.remove("modal-dragging");
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    props.onDismiss();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    const modal = props.modalRef.current;
    if (!modal) {
      return;
    }

    const target = event.target as HTMLElement;
    const titleBar = target.closest<HTMLElement>("[data-window-drag-handle='true']");
    const windowKey = modal.dataset.windowKey;
    if (!windowKey || !titleBar || !modal.contains(titleBar)) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const rect = modal.getBoundingClientRect();
    dragOffsetXRef.current = event.clientX - rect.left;
    dragOffsetYRef.current = event.clientY - rect.top;
    dragPointerIdRef.current = event.pointerId;
    dragHandleRef.current = titleBar;

    placeModalAt(modal, {
      left: rect.left,
      top: rect.top,
    });

    modal.classList.add("is-dragging");
    document.body.classList.add("modal-dragging");
    titleBar.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    const modal = props.modalRef.current;
    if (!modal || dragPointerIdRef.current === null || event.pointerId !== dragPointerIdRef.current) {
      return;
    }

    const clamped = clampModalPosition(modal, {
      left: event.clientX - dragOffsetXRef.current,
      top: event.clientY - dragOffsetYRef.current,
    });
    placeModalAt(modal, clamped);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>): void {
    if (dragPointerIdRef.current !== null && event.pointerId === dragPointerIdRef.current) {
      stopModalDrag();
    }
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>): void {
    if (dragPointerIdRef.current !== null && event.pointerId === dragPointerIdRef.current) {
      stopModalDrag();
    }
  }

  useEffect(() => {
    const modal = props.modalRef.current;
    if (!modal) {
      return;
    }

    if (props.chrome.windowKey) {
      modal.dataset.windowKey = props.chrome.windowKey;
    } else {
      delete modal.dataset.windowKey;
    }

    applySavedWindowPosition(
      modal,
      props.chrome.modalHidden ? null : (props.chrome.windowKey ?? null),
    );
  }, [props.chrome.modalHidden, props.chrome.windowKey, props.modalRef]);

  useEffect(() => {
    if (props.chrome.modalHidden) {
      stopModalDrag();
    }
  }, [props.chrome.modalHidden]);

  useEffect(() => () => {
    document.body.classList.remove("modal-dragging");
  }, []);

  return (
    <div
      id="modal-backdrop"
      className={props.chrome.modalHidden ? "modal-backdrop hidden" : "modal-backdrop"}
      onClick={handleBackdropClick}
    >
      <div
        id="modal"
        ref={props.modalRef}
        className={props.chrome.modalClass ? `modal ${props.chrome.modalClass}` : "modal"}
        role="dialog"
        aria-modal="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={stopModalDrag}
      >
        {props.children}
      </div>
    </div>
  );
}
