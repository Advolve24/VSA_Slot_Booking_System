import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function EnrollmentInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoice/enrollment/${id}`);
      setInvoice(res.data?.data || null);
    } catch (err) {
      console.error("Invoice fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load invoice.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      toast({
        title: "Generating Invoice...",
        description: "Please wait while we prepare your PDF.",
      });

      const res = await api.get(
        `/invoice/enrollment/${id}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });

    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download Failed",
        description: "Something went wrong while downloading invoice.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return <div className="p-6">Loading invoice...</div>;

  if (!invoice)
    return <div className="p-6 text-red-500">Invoice not found</div>;

  /* ================= COMPANY INFO ================= */

  const company = {
    name: "Vidyanchal Sports Academy",
    addressLine1:
      "Vidyanchal School Sr. No. 259 Balaji Park Behind Seasons Business Square",
    addressLine2:
      "Baner, Pune, Maharashtra - 411007",
    phone: "+91 9922143210",
    email: "vidyanchalsportsacademy@gmail.com",
    gst: "29ABCDE1234F1Z5",
  };

  /* ================= DATES ================= */

  const issueDate = invoice.createdAt
    ? format(new Date(invoice.createdAt), "dd MMM yyyy")
    : "-";

  const invoiceNo = invoice?._id
    ? "INV-" + invoice._id.slice(-6).toUpperCase()
    : "-";

  /* ================= CALCULATIONS ================= */

  const subTotal = invoice.baseAmount || 0;
  const discount = invoice.totalDiscountAmount || 0;
  const grandTotal = invoice.finalAmount || 0;

  const qty = invoice.durationMonths || 1;

  const status =
    invoice.paymentStatus === "paid"
      ? "bg-green-100 text-green-700"
      : "bg-orange-100 text-orange-700";

  /* ================= DISCOUNT LIST ================= */

  const discountList = invoice.discounts || [];

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4 sm:mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      {/* INVOICE CARD */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow border">
        {/* HEADER */}
        <div className="p-4 sm:p-8 border-b flex justify-between items-start">
          <div className="flex items-start sm:items-center gap-2 max-w-[65%]">
            <img
              src="/VSA-Logo-1.png"
              alt="VSA"
              className="h-8 sm:h-12 object-contain mt-1"
            />
            <h2 className="text-md sm:text-xl font-semibold">
              {company.name}
            </h2>
          </div>

          <div className="text-right">
            <h2 className="text-sm sm:text-2xl font-bold">
              INVOICE
            </h2>
            <p className="text-[12px] text-green-600">
              {invoiceNo}
            </p>
            <span
              className={`inline-block mt-1 text-[10px] px-3 py-1 rounded-full ${status}`}
            >
              {invoice.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* BILL SECTION */}
        <div className="p-4 sm:p-8 border-b">
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            {/* FROM */}
            <div className="text-sm">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                BILLED FROM
              </p>
              <p className="font-semibold">{company.name}</p>
              <p>{company.addressLine1}</p>
              <p>{company.addressLine2}</p>
              <p className="mt-2">{company.phone}</p>
              <p>{company.email}</p>
              <p>GSTIN: {company.gst}</p>
            </div>

            {/* TO */}
            <div className="text-sm md:text-right">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                BILLED TO
              </p>
              <p className="font-semibold">
                {invoice.playerName}
              </p>
              <p>{invoice.mobile}</p>
              <p>{invoice.email || "-"}</p>

              {invoice.address?.localAddress && (
                <p className="mt-1">
                  {invoice.address.localAddress},{" "}
                  {invoice.address.city}
                </p>
              )}

              <p className="mt-3">
                Payment Date:{" "}
                <strong>{issueDate}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="p-4 sm:p-8 border-b">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            ITEMS & SERVICES
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right hidden sm:table-cell">
                  Qty
                </th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="p-3">1</td>
                <td className="p-3">
                  {invoice.sportName} - {invoice.batchName}
                  <div className="mt-1 text-xs text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded">
                    COACHING
                  </div>
                </td>
                <td className="p-3 text-right hidden sm:table-cell">
                  {qty}
                </td>
                <td className="p-3 text-right">
                  ₹{invoice.monthlyFee || 0}
                </td>
                <td className="p-3 text-right font-medium">
                  ₹{subTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="p-4 sm:p-8 flex justify-end">
          <div className="w-full sm:w-96 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>

            {/* Discount breakdown */}
            {discountList.map((d, index) => (
              <div
                key={index}
                className="flex justify-between text-red-600"
              >
                <span>{d.title || d.code}</span>
                <span>- ₹{d.discountAmount}</span>
              </div>
            ))}

            <div className="flex justify-between text-red-600">
              <span>Total Discount</span>
              <span>- ₹{discount}</span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg text-green-700">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="border-t p-4 sm:p-6 text-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            PAYMENT INFORMATION
          </p>
          <p>Method: {invoice.paymentMode?.toUpperCase()}</p>
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 sm:p-4 text-center text-xs text-gray-500">
          Thank you for choosing {company.name}. <br />
          For queries contact {company.email}
        </div>
      </div>
    </div>
  );
}
