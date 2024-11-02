// src/app/admin/orders/[orderId]/PrintableOrder.tsx
"use client";

import React, { forwardRef } from "react";
import { IOrder, IOrderItem } from "@/models/Order";

interface PrintableOrderProps {
  order: IOrder;
}

const PrintableOrder = forwardRef<HTMLDivElement, PrintableOrderProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="mb-4">
        <strong>Order ID:</strong> {order._id}
      </div>
      <div className="mb-4">
        <strong>Customer Name:</strong> {order.customerName}
      </div>
      <div className="mb-4">
        <strong>Contact Number:</strong> {order.customerNumber}
        {order.otherNumber && <span>, {order.otherNumber}</span>}
      </div>
      <div className="mb-4">
        <strong>Address Line 1:</strong>
        <p>{order.address1}</p>
      </div>
      {order.address2 && (
        <div className="mb-4">
          <strong>Address Line 2:</strong>
          <p>{order.address2}</p>
        </div>
      )}
      <div className="mb-4">
        <strong>Order Items:</strong>
        <ul className="list-disc list-inside">
          {order.items.map((item: IOrderItem, index: number) => (
            <li key={index}>
              {item.name} - Color: {item.color}, Size: {item.size} x{" "}
              {item.quantity} @ Tk. {item.price} each
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <strong>Total Amount:</strong> Tk. {order.totalAmount}
      </div>
      <div className="mb-4">
        <strong>Order Date:</strong>{" "}
        {new Date(order.createdAt).toLocaleString()}
      </div>
    </div>
  );
});

PrintableOrder.displayName = "PrintableOrder";

export default PrintableOrder;
