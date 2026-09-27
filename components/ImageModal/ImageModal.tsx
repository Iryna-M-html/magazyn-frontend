import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./ImageModal.module.css";

interface ImageModalProps {
  imageUrl: string | null;
  altText?: string;
  onClose: () => void;
}

export const ImageModal = ({
  imageUrl,
  altText = "Изображение",
  onClose,
}: ImageModalProps) => {
  useEffect(() => {
    if (!imageUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) {
    return null;
  }

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображения"
    >
      <div className={styles.modalContent} onClick={handleContentClick}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <img src={imageUrl} alt={altText} className={styles.image} />
      </div>
    </div>,
    document.body,
  );
};
