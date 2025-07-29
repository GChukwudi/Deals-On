import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Expanded(
            flex: 3,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(12),
                ),
                color: Colors.grey.shade100,
              ),
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(12),
                ),
                child: product.imageUrl.isNotEmpty
                    ? Image.network(
                        product.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(
                            Icons.image_not_supported,
                            size: 50,
                            color: Colors.grey,
                          );
                        },
                      )
                    : const Icon(
                        Icons.shopping_bag,
                        size: 50,
                        color: Colors.grey,
                      ),
              ),
            ),
          ),

          // Product Details
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(8), // Reduced from 12 to 8
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min, // Added this
                    children: [
                      // Product Name
                      Flexible(
                        // Wrapped with Flexible
                        child: Text(
                          product.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13, // Reduced from 14 to 13
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: 4),

                      // Price and Stock
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            // Wrapped with Flexible
                            child: Text(
                              '\$${product.price.toStringAsFixed(2)}',
                              style: TextStyle(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 14, // Reduced from 16 to 14
                              ),
                            ),
                          ),
                          Text(
                            'Stock: ${product.stock}',
                            style: TextStyle(
                              color:
                                  product.isInStock ? Colors.green : Colors.red,
                              fontSize: 11, // Reduced from 12 to 11
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                          height: 4), // Reduced from Spacer() to fixed height

                      // Add to Cart Button
                      SizedBox(
                        width: double.infinity,
                        height: 32, // Fixed height for button
                        child: Consumer<CartProvider>(
                          builder: (context, cart, _) {
                            return ElevatedButton(
                              onPressed: product.isInStock
                                  ? () async {
                                      final success =
                                          await cart.addToCart(product.id, 1);
                                      if (success && context.mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: Text(
                                                '${product.name} added to cart'),
                                            duration:
                                                const Duration(seconds: 2),
                                            backgroundColor: Colors.green,
                                          ),
                                        );
                                      } else if (context.mounted &&
                                          cart.error != null) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: Text(cart.error!),
                                            duration:
                                                const Duration(seconds: 3),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                        cart.clearError();
                                      }
                                    }
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: product.isInStock
                                    ? Theme.of(context).primaryColor
                                    : Colors.grey,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 4, // Reduced from 8 to 4
                                  horizontal: 8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                minimumSize: Size.zero, // Added this
                              ),
                              child: Text(
                                product.isInStock
                                    ? 'Add to Cart'
                                    : 'Out of Stock',
                                style: const TextStyle(
                                    fontSize: 11), // Reduced from 12 to 11
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
