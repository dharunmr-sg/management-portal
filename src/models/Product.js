export default class Product {
  constructor({
    id = null,
    title = "",
    description = "",
    category = "",
    price = 0,
    discountPercentage = 0,
    rating = 0,
    stock = 0,
    tags = [],
    brand = "",
    sku = "",
    weight = 0,
    dimensions = {},
    warrantyInformation = "",
    shippingInformation = "",
    availabilityStatus = "",
    reviews = [],
    returnPolicy = "",
    minimumOrderQuantity = 1,
    meta = {},
    images = [],
    thumbnail = ""
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.price = price;
    this.discountPercentage = discountPercentage;
    this.rating = rating;
    this.stock = stock;
    this.tags = tags;
    this.brand = brand;
    this.sku = sku;
    this.weight = weight;
    this.dimensions = dimensions;
    this.warrantyInformation = warrantyInformation;
    this.shippingInformation = shippingInformation;
    this.availabilityStatus = availabilityStatus;
    this.reviews = reviews;
    this.returnPolicy = returnPolicy;
    this.minimumOrderQuantity = minimumOrderQuantity;
    this.meta = meta;
    this.images = images;
    this.thumbnail = thumbnail;
  }

  static fromJSON(json = {}) {
    return new Product(json);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      price: this.price,
      discountPercentage: this.discountPercentage,
      rating: this.rating,
      stock: this.stock,
      tags: this.tags,
      brand: this.brand,
      sku: this.sku,
      weight: this.weight,
      dimensions: this.dimensions,
      warrantyInformation: this.warrantyInformation,
      shippingInformation: this.shippingInformation,
      availabilityStatus: this.availabilityStatus,
      reviews: this.reviews,
      returnPolicy: this.returnPolicy,
      minimumOrderQuantity: this.minimumOrderQuantity,
      meta: this.meta,
      images: this.images,
      thumbnail: this.thumbnail
    };
  }
}
