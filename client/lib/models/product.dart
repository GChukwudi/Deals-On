class Product {
  final int id;
  final String name;
  final double price;
  final int stock;
  final String description;
  final String imageUrl;
  final DateTime? createdAt;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.stock,
    required this.description,
    required this.imageUrl,
    this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      price: (json['price'] as num).toDouble(),
      stock: json['stock'],
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'stock': stock,
      'description': description,
      'image_url': imageUrl,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  bool get isInStock => stock > 0;
}
