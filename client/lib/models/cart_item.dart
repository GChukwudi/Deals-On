class CartItem {
  final int id;
  final int productId;
  final String name;
  final double price;
  final int quantity;
  final String imageUrl;

  CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.imageUrl,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      productId: json['product_id'],
      name: json['name'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      imageUrl: json['image_url'] ?? '',
    );
  }

  double get totalPrice => price * quantity;
}

class Cart {
  final List<CartItem> items;
  final double total;
  final int count;

  Cart({
    required this.items,
    required this.total,
    required this.count,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      total: (json['total'] as num).toDouble(),
      count: json['count'],
    );
  }

  bool get isEmpty => items.isEmpty;
}
