import React, { useEffect } from 'react'
import '../styles/Toast.css'

/**
 * Toast component for displaying temporary success messages
 * 
 * How it works:
 * - Uses position: fixed to overlay the page (doesn't move other content)
 * - Appears at bottom-right corner
 * - Auto-hides after duration milliseconds
 * - Only shows when message prop is not empty
 * 
 * @param {string} message - The message to display
 * @param {function} onClose - Callback when toast should close
 * @param {number} duration - How long to show toast (milliseconds), default 3000
 */
function Toast({ message, onClose, duration = 3000 }) {
    useEffect(() => {
        // Only set timer if there's a message to show
        if (message) {
            // Auto-hide after duration
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            // Cleanup: clear timer if component unmounts or message changes
            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    // Don't render anything if there's no message
    if (!message) {
        return null;
    }

    return (
        <div className="toast-container">
            <div className="toast-message">
                <span className="toast-icon">✓</span>
                <span className="toast-text">{message}</span>
            </div>
        </div>
    );
}

export default Toast
