"use client";

import React, { useEffect, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import styles from "./BarcodeScanner.module.css";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
}) => {
  const [html5Qrcode, setHtml5Qrcode] = useState<Html5Qrcode | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);

  useEffect(() => {
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
    ];

    const scanner = new Html5Qrcode("reader", { formatsToSupport });
    setHtml5Qrcode(scanner);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decodedText) => {
          scanner
            .stop()
            .then(() => {
              onScanSuccess(decodedText);
            })
            .catch(console.error);
        },
        () => {},
      )
      .catch((err) => console.error("Ошибка запуска камеры:", err));

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const toggleFlashlight = async () => {
    if (html5Qrcode) {
      try {
        const nextState = !isTorchOn;
        await html5Qrcode.applyVideoConstraints({
          advanced: [{ torch: nextState } as Record<string, unknown>],
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn("Фонарик не поддерживается", err);
      }
    }
  };

  return (
    <div className={styles.scannerWrapper}>
      <div id="reader" className={styles.videoContainer}></div>

      <button
        type="button"
        className={`${styles.flashButton} ${isTorchOn ? styles.active : ""}`}
        onClick={toggleFlashlight}
        title="Фонарик"
      >
        ⚡
      </button>

      <div className={styles.overlay}>
        <div className={styles.targetFrame}>
          <div className={`${styles.corner} ${styles.tl}`}></div>
          <div className={`${styles.corner} ${styles.tr}`}></div>
          <div className={`${styles.corner} ${styles.bl}`}></div>
          <div className={`${styles.corner} ${styles.br}`}></div>
          <div className={styles.scanLine}></div>
        </div>
      </div>
    </div>
  );
};
