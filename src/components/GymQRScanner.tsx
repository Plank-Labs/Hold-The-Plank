import { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

interface GymQRScannerProps {
  onClose?: () => void;
}

interface ScanResult {
  gymId: number | null;
  qrSecret: string | null;
  error: string | null;
}

/**
 * Parses a gym QR code URL and extracts gymId and qrSecret
 * Expected format: https://conquerplank.app/gym/join?id={gymId}&secret={qrSecret}
 */
function parseGymQRUrl(url: string): ScanResult {
  try {
    const urlObj = new URL(url);
    
    // Validate it's a gym join URL
    if (!urlObj.pathname.includes('/gym/join')) {
      return { gymId: null, qrSecret: null, error: 'Invalid QR code: Not a gym link' };
    }

    const gymIdParam = urlObj.searchParams.get('id');
    const qrSecret = urlObj.searchParams.get('secret') || urlObj.searchParams.get('ref');

    if (!gymIdParam) {
      return { gymId: null, qrSecret: null, error: 'Invalid QR code: Missing gym ID' };
    }

    const gymId = parseInt(gymIdParam, 10);
    if (isNaN(gymId)) {
      return { gymId: null, qrSecret: null, error: 'Invalid QR code: Invalid gym ID' };
    }

    return { gymId, qrSecret, error: null };
  } catch {
    return { gymId: null, qrSecret: null, error: 'Invalid QR code format' };
  }
}

export function GymQRScanner({ onClose }: GymQRScannerProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = useCallback((result: { rawValue: string }[]) => {
    if (!isScanning || !result || result.length === 0) return;

    const scannedUrl = result[0].rawValue;
    const parsedResult = parseGymQRUrl(scannedUrl);

    if (parsedResult.error) {
      setError(parsedResult.error);
      return;
    }

    // Stop scanning to prevent multiple navigations
    setIsScanning(false);
    setError(null);

    // Navigate to GymJoin page with parsed params
    const queryParams = new URLSearchParams();
    queryParams.set('id', String(parsedResult.gymId));
    if (parsedResult.qrSecret) {
      queryParams.set('secret', parsedResult.qrSecret);
    }

    navigate(`/gym/join?${queryParams.toString()}`);
  }, [isScanning, navigate]);

  const handleError = useCallback((error: unknown) => {
    console.error('QR Scanner error:', error);
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please use a device with a camera.');
      } else {
        setError(`Scanner error: ${error.message}`);
      }
    }
  }, []);

  return (
    <div className="gym-qr-scanner">
      <div className="scanner-header">
        <h2>Scan Gym QR Code</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Close scanner">
            ✕
          </button>
        )}
      </div>

      <div className="scanner-container">
        {isScanning && (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment', // Use back camera on mobile
            }}
            styles={{
              container: {
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1',
              },
            }}
          />
        )}

        <div className="scanner-overlay">
          <div className="scanner-frame" />
        </div>
      </div>

      {error && (
        <div className="scanner-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button 
            className="retry-btn"
            onClick={() => {
              setError(null);
              setIsScanning(true);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="scanner-instructions">
        <p>Point your camera at a gym's QR code to check in</p>
      </div>

      <style>{`
        .gym-qr-scanner {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #fff;
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 400px;
          margin-bottom: 1.5rem;
        }

        .scanner-header h2 {
          margin: 0;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #C5A572, #E8D5B7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          font-size: 1.25rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .scanner-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .scanner-frame {
          width: 70%;
          aspect-ratio: 1;
          border: 3px solid #C5A572;
          border-radius: 12px;
          box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.5);
        }

        .scanner-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding: 1rem 1.5rem;
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.5);
          border-radius: 12px;
          max-width: 400px;
          text-align: center;
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .retry-btn {
          background: linear-gradient(135deg, #C5A572, #A08050);
          border: none;
          color: #1a1a2e;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(197, 165, 114, 0.4);
        }

        .scanner-instructions {
          margin-top: 1.5rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
        }

        .scanner-instructions p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default GymQRScanner;
