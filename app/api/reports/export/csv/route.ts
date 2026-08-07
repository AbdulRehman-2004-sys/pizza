import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role, OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "orders";

    let csvContent = "";

    if (reportType === "payments") {
      const payments = await prisma.payment.findMany({
        orderBy: { paidAt: "desc" },
        include: {
          invoice: { select: { invoiceNumber: true, order: { select: { orderNumber: true } } } },
          processedBy: { select: { name: true } },
        },
      });

      csvContent = "Invoice Number,Order Number,Method,Amount Paid (PKR),Processed By,Paid At\n";
      payments.forEach((p) => {
        csvContent += `"${p.invoice.invoiceNumber}","${p.invoice.order.orderNumber}","${p.method}",${p.amount},"${p.processedBy.name}","${new Date(p.paidAt).toLocaleString()}"\n`;
      });
    } else {
      // Default: Orders export
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, phone: true } },
          cashier: { select: { name: true } },
          invoice: { select: { invoiceNumber: true, payment: { select: { method: true } } } },
        },
      });

      csvContent = "Order Number,Invoice Number,Type,Customer,Status,Payment Method,Subtotal (PKR),Tax (PKR),Discount (PKR),Grand Total (PKR),Cashier,Created At\n";
      orders.forEach((o) => {
        csvContent += `"${o.orderNumber}","${o.invoice?.invoiceNumber || "N/A"}","${o.type}","${o.customer?.name || "Walk-in"}","${o.status}","${o.invoice?.payment?.method || "Unpaid"}",${o.subtotal},${o.taxAmount},${o.discountAmount},${o.totalAmount},"${o.cashier.name}","${new Date(o.createdAt).toLocaleString()}"\n`;
      });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pos_report_${reportType}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/reports/export/csv error:", error);
    return new NextResponse("Export generation failed", { status: 500 });
  }
}
