const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  OrderID: {
    type: String,
    required: true,
    unique: true,
  },
  Products: {
    type: [
      {
        ProductID: {
          type: String,
          required: true,
        },
        ProductTitle: {
          type: String,
          required: true,
        },
        ProductImage: {
          type: String,
          required: true,
        },
        PublicationID: {
          type: String,
        },
        BrandID: {
          type: String,
        },
        ProductType: {
          type: String,
          required: true,
        },
        Quantity: {
          type: Number,
          required: true,
        },
        RegularPrice: {
          type: String,
          required: true,
        },
        SalePrice: {
          type: String,
          required: true,
        },
        TotalPrice: {
          type: String,
          required: true,
        },
        UnitWeight: {
          type: String,
          required: true,
          default: 200,
        },
      },
    ],
    required: true,
  },
  OrderCreatedAt: {
    type: Date,
    required: true,
    default: new Date()
  },
  ShippingAddress: {
    type: {
      FullName: {
        type: String,
        required: true,
      },
      PhoneNumber: {
        type: String,
        required: true,
      },
      AlternatePhoneNumber: {
        type: String,
      },
      ReceiveAt: {
        type: Number, // 1 = Home, 2 = Office
        required: true,
      },
      Address: {
        type: String,
        required: true,
      },
      DivisionID: {
        type: Number,
        required: true,
      },
      DistrictID: {
        type: Number,
        required: true,
      },
      UpazilaID: {
        type: Number,
        required: true,
      }
    },
    required: true,
  },
  BillingAddress: {
    type: {
      FullName: {
        type: String,
        required: true,
      },
      PhoneNumber: {
        type: String,
        required: true,
      },
      AlternatePhoneNumber: {
        type: String,
      },
      ReceiveAt: {
        type: Number, // 1 = Home, 2 = Office
        required: true,
      },
      Address: {
        type: String,
        required: true,
      },
      DivisionID: {
        type: Number,
        required: true,
      },
      DistrictID: {
        type: Number,
        required: true,
      },
      UpazilaID: {
        type: Number,
        required: true,
      }
    },
    required: true,
  },
  Gift: {
    type: Boolean,
    required: true,
    default: false
  },
  CustomerID: {
    type: String,
    required: true,
  },
  CustomPlacedOrder: {
    type: Boolean,
    required: true,
    default: false
  },
  OrderStatus: {
    type: String,
    required: true,
    default: "PENDING_PAYMENT",
  },
  OrderTracking: {
    type: [
      {
        Status: {
          type: String,
          required: true,
          default: "PENDING_PAYMENT",
        },
        Date: {
          type: Date,
          required: true,
          default: new Date(),
        },
      },
    ],
  },
  Price: {
    type: String,
    required: true,
  },
  DeliveryCharge: {
    type: String,
    required: true,
  },
  GiftWrap: {
    type: Boolean,
    required: true,
    default: false,
  },
  CouponCode: {
    type: String,
  },
  CouponDiscount: {
    type: String,
  },
  TotalPrice: {
    type: String,
    required: true,
  },
  AdvancePaid: {
    type: String,
    required: true,
    default: "0",
  },
  PaymentMethod: {
    type: String, // BKASH
    required: true,
    default: 1,
  },
  COD: {
    type: Boolean,
    required: true,
  },
  TrxID: {
    type: String,
  },
  Completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  Cancelled: {
    type: Boolean,
    required: true,
    default: false,
  },
  CancellationReason: {
    type: String,
  },
  CancelledAt: {
    type: Date,
  },
  Refunded: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const OrderModel = mongoose.model("orders", OrderSchema);
module.exports = OrderModel;
