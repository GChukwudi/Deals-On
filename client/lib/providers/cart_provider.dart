import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/order.dart';
import '../services/api_service.dart';

class CartProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  Cart? _cart;
  List<Order> _orders = [];
  bool _isLoading = false;
  String? _error;

  Cart? get cart => _cart;
  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get itemCount => _cart?.count ?? 0;
  double get total => _cart?.total ?? 0.0;

  Future<void> loadCart() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _cart = await _apiService.getCart();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _cart = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> addToCart(int productId, int quantity) async {
    try {
      await _apiService.addToCart(productId, quantity);
      await loadCart(); // Refresh cart
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateCartItem(int itemId, int quantity) async {
    try {
      await _apiService.updateCartItem(itemId, quantity);
      await loadCart(); // Refresh cart
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> removeFromCart(int itemId) async {
    try {
      await _apiService.removeFromCart(itemId);
      await loadCart(); // Refresh cart
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> clearCart() async {
    try {
      await _apiService.clearCart();
      _cart = Cart(items: [], total: 0.0, count: 0);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> loadOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _orders = await _apiService.getOrders();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _orders = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createOrder() async {
    try {
      await _apiService.createOrder();
      _cart = Cart(items: [], total: 0.0, count: 0);
      await loadOrders(); // Refresh orders
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
