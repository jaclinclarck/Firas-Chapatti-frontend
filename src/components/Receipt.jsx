"use client"
import { X, Printer } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

function Receipt({ order, onClose, t }) {
  const formatPrice = (price) => (price / 1000).toFixed(3) + " DT"
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR") + " " + new Date(dateString).toLocaleTimeString("fr-FR")

  // ======================== GÉNÉRATION PDF ========================
  const handlePDF = async () => {
    const pdf = new jsPDF("p", "pt", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()   // 595 pt
    const pdfHeight = pdf.internal.pageSize.getHeight() // 842 pt

    const receipts = document.querySelectorAll(".print-receipt")
    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i]

      // Étendre le conteneur pour correspondre à A4
      receipt.style.minHeight = `${pdfHeight}px`
      receipt.style.width = `${pdfWidth}px`

      const canvas = await html2canvas(receipt, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")

      // Ajoute l'image au PDF en pleine page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      if (i < receipts.length - 1) pdf.addPage()
    }

    pdf.save(`reçus_${order.orderNumber || "N/A"}.pdf`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header (non imprimé) */}
        <div className="flex justify-between items-center p-4 border-b bg-primary text-white no-print">
          <h2 className="text-xl font-bold">{t.receipts}</h2>
          <button onClick={onClose} className="hover:bg-blue-600 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* PRINT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ================= PAGE 1 : CUISINE ================= */}
          <div className="print-page print-receipt border-2 border-gray-300 rounded-lg p-6 bg-yellow-50">
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-400">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">JAM-JEM CHAPATTI</h3>
              <p className="text-lg font-bold text-yellow-600">{t.kitchenReceipt}</p>
            </div>

            <div className="mb-4 text-center">
              <p className="text-3xl font-bold text-gray-800 mb-1">{t.orderNumber}{order.orderNumber || "N/A"}</p>
              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
            </div>

            {order.customerName && (
              <div className="mb-4 bg-white p-3 rounded">
                <p className="font-semibold">{t.client}: {order.customerName}</p>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-gray-800">{t.itemsToPrepare}</h4>
              {order.items?.map((item, idx) => (
                <div key={idx} className="mb-4 bg-white p-3 rounded border-l-4 border-yellow-600 break-inside-avoid">
                  <p className="font-bold text-xl text-gray-800">{item.quantity}x {item.name}</p>
                  {item.supplements?.length > 0 && (
                    <ul className="text-sm mt-2 ml-4 list-disc text-gray-600">
                      {item.supplements.map((sup, supIdx) => (
                        <li key={supIdx}>{sup.name} x{sup.quantity ?? 1}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="bg-red-50 border-2 border-red-300 p-3 rounded break-inside-avoid">
                <p className="font-bold text-red-700">{t.notes} :</p>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* ================= PAGE 2 : CLIENT ================= */}
          <div className="print-page print-receipt border-2 border-gray-300 rounded-lg p-6 bg-blue-50">
            <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-400">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">JAM-JEM CHAPATTI</h3>
              <p className="text-lg font-bold text-primary">{t.customerReceipt}</p>
            </div>

            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-gray-800 mb-1">{t.orderNumber}{order.orderNumber || "N/A"}</p>
              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
            </div>

            {order.customerName && (
              <p className="mb-4 text-gray-700">{t.client}: <span className="font-semibold">{order.customerName}</span></p>
            )}

            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">{t.orderDetails}</h4>
              {order.items?.map((item, idx) => (
                <div key={idx} className="mb-3 flex justify-between break-inside-avoid">
                  <div>
                    <p className="font-semibold text-gray-800">{item.quantity}x {item.name}</p>
                    {item.supplements?.length > 0 && (
                      <p className="text-xs text-gray-600 ml-4">
                        + {item.supplements.map((sup) => `${sup.name} x${sup.quantity ?? 1}`).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="font-semibold text-gray-800">{formatPrice(item.itemTotal)}</div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-400 pt-4 space-y-2">
              <div className="flex justify-between text-2xl font-bold">
                <span>{t.total.toUpperCase()}</span>
                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
              <p className="text-sm text-gray-600">{t.payment}: <span className="font-semibold capitalize">{order.paymentMethod}</span></p>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
              <p className="font-semibold">{t.thankYou}</p>
              <p>{t.seeYouSoon}</p>
            </div>
          </div>
        </div>

        {/* Footer (non imprimé) */}
        <div className="border-t p-4 flex gap-3 bg-gray-50 no-print">
          <button
            onClick={handlePDF}
            className="flex-1 py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <Printer size={20} /> {t.printReceipts}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
