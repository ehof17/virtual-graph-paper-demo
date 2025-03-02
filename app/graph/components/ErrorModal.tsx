"use client";
import React from "react";
import styles from "../../styles/ErrorModal.module.css";
interface ErrorModalProps {
  
  show: boolean;
  message: string;
  onClose: () => void;
}
const ErrorModal: React.FC<ErrorModalProps> = ({ show, message, onClose }) => {
    if (!show) return null;
  
    return (
      <div className={styles.errorModalOverlay}>
        <div className={styles.errorModalContainer}>
          <h2 className={styles.errorModalTitle}>Error</h2>
          <p className={styles.errorModalMessage}>{message}</p>
          <button className={styles.errorModalCloseButtonTop}onClick={onClose}>
            ✕
          </button>
          <button className={styles.errorModalCloseButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default ErrorModal;
