
import React, { useState } from 'react';
import { QrCode, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents } from '../../data/mockData';

interface QRScannerProps {
  onScanComplete: (studentId: string, status: 'Present' | 'Absent') => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanComplete, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{ student: any; success: boolean } | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate QR scanning - in real implementation, this would use camera
    setTimeout(() => {
      const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
      const mockQRCode = `STUDENT:${randomStudent.id}`;
      setScannedCode(mockQRCode);
      
      const student = mockStudents.find(s => mockQRCode.includes(s.id));
      if (student) {
        setScanResult({ student, success: true });
        onScanComplete(student.id, 'Present');
      } else {
        setScanResult({ student: null, success: false });
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleReset = () => {
    setScannedCode('');
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">QR Code Scanner</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {!isScanning && !scanResult && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Position the QR code within the frame</p>
            <Button onClick={handleStartScan} className="w-full">
              Start Scanning
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 border-2 border-blue-500 rounded-lg flex items-center justify-center animate-pulse">
              <QrCode className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-blue-600 mb-4">Scanning...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="text-center">
            {scanResult.success ? (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">{scanResult.student.name}</h4>
                  <p className="text-sm text-green-600">{scanResult.student.rollNumber}</p>
                  <p className="text-sm text-green-600">Marked as Present</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600">Invalid QR Code</p>
                </div>
              </div>
            )}
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Scan Another
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
