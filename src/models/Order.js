export default class Order {
  constructor({
    id = null,
    userId = null,
    customerName = "",
    products = [],
    totalAmount = 0,
    status = "Pending",
    orderDate = "",
    paymentMethod = "",
    shippingAddress = {}
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.customerName = customerName;
    this.products = products;
    this.totalAmount = totalAmount;
    this.status = status;
    this.orderDate = orderDate;
    this.paymentMethod = paymentMethod;
    this.shippingAddress = shippingAddress;
  }

  static fromJSON(json = {}) {
    return new Order(json);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      customerName: this.customerName,
      products: this.products,
      totalAmount: this.totalAmount,
      status: this.status,
      orderDate: this.orderDate,
      paymentMethod: this.paymentMethod,
      shippingAddress: this.shippingAddress
    };
  }
}
