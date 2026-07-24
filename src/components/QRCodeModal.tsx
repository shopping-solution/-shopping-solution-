import React, { useRef } from 'react';
import { X, Download, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  onClose: () => void;
  url: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, url }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = document.getElementById('website-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        ctx.fillStyle = "#1c1917";
        ctx.font = "bold 20px serif";
        ctx.textAlign = "center";
        ctx.fillText("ZORUQ", canvas.width / 2, canvas.height - 30);
        
        ctx.font = "14px sans-serif";
        ctx.fillText("Style That Speaks", canvas.width / 2, canvas.height - 10);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "ZORUQ_QRCode.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = document.getElementById('website-qr-code');
    const svgData = svg ? new XMLSerializer().serializeToString(svg) : '';

    const html = `
      <html>
        <head>
          <title>ZORUQ QR Code</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            h1 { font-family: serif; font-size: 32px; margin-bottom: 5px; color: #1c1917; }
            p { margin-top: 0; font-size: 18px; color: #57534e; }
            .qr-container { margin: 20px; padding: 20px; border: 2px solid #e5e5e5; border-radius: 12px; }
          </style>
        </head>
        <body>
          <h1>ZORUQ</h1>
          <p>Style That Speaks</p>
          <div class="qr-container">
            ${svgData}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-stone-900 border border-amber-500/40 w-full max-w-sm rounded-2xl p-6 text-stone-100 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-amber-400 flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Website QR Code
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl mb-6" ref={qrRef}>
          <QRCodeSVG
            id="website-qr-code"
            value={url}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#1c1917"
            bgColor="#ffffff"
          />
          <h3 className="text-stone-950 font-serif font-bold text-2xl mt-4 tracking-widest">ZORUQ</h3>
          <p className="text-stone-500 text-sm tracking-widest uppercase">Style That Speaks</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-bold rounded-xl transition-colors border border-stone-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl transition-colors shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
