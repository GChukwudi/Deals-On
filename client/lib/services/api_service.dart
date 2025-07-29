import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import '../models/user.dart';
import '../models/product.dart';
import '../models/cart_item.dart';
import '../models/order.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
  }

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  Map<String, String> get _headers {
    Map<String, String> headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final data = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Unknown error occurred');
    }
  }

  // Authentication
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.loginEndpoint}'),
      headers: _headers,
      body: json.encode({'email': email, 'password': password}),
    );

    final data = await _handleResponse(response);
    await setToken(data['token']);

    // Save user data
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, json.encode(data['user']));

    return data;
  }

  Future<Map<String, dynamic>> register(
      String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.registerEndpoint}'),
      headers: _headers,
      body: json.encode({'name': name, 'email': email, 'password': password}),
    );

    final data = await _handleResponse(response);
    await setToken(data['token']);

    // Save user data
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, json.encode(data['user']));

    return data;
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(AppConstants.userKey);
    if (userData != null) {
      return User.fromJson(json.decode(userData));
    }
    return null;
  }

  // Products
  Future<List<Product>> getProducts() async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.productsEndpoint}'),
      headers: _headers,
    );

    final data = await _handleResponse(response);
    return (data['products'] as List)
        .map((product) => Product.fromJson(product))
        .toList();
  }

  Future<Product> createProduct(Map<String, dynamic> productData) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.productsEndpoint}'),
      headers: _headers,
      body: json.encode(productData),
    );

    final data = await _handleResponse(response);
    return Product.fromJson(data['product']);
  }

  Future<Product> updateProduct(
      int id, Map<String, dynamic> productData) async {
    final response = await http.put(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.productsEndpoint}/$id'),
      headers: _headers,
      body: json.encode(productData),
    );

    final data = await _handleResponse(response);
    return Product.fromJson(data['product']);
  }

  Future<void> deleteProduct(int id) async {
    final response = await http.delete(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.productsEndpoint}/$id'),
      headers: _headers,
    );

    await _handleResponse(response);
  }

  // Cart
  Future<Cart> getCart() async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.cartEndpoint}'),
      headers: _headers,
    );

    final data = await _handleResponse(response);
    return Cart.fromJson(data);
  }

  Future<void> addToCart(int productId, int quantity) async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.cartEndpoint}/items'),
      headers: _headers,
      body: json.encode({'product_id': productId, 'quantity': quantity}),
    );

    await _handleResponse(response);
  }

  Future<void> updateCartItem(int itemId, int quantity) async {
    final response = await http.put(
      Uri.parse(
          '${AppConstants.baseUrl}${AppConstants.cartEndpoint}/items/$itemId'),
      headers: _headers,
      body: json.encode({'quantity': quantity}),
    );

    await _handleResponse(response);
  }

  Future<void> removeFromCart(int itemId) async {
    final response = await http.delete(
      Uri.parse(
          '${AppConstants.baseUrl}${AppConstants.cartEndpoint}/items/$itemId'),
      headers: _headers,
    );

    await _handleResponse(response);
  }

  Future<void> clearCart() async {
    final response = await http.delete(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.cartEndpoint}'),
      headers: _headers,
    );

    await _handleResponse(response);
  }

  // Orders
  Future<List<Order>> getOrders() async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.ordersEndpoint}'),
      headers: _headers,
    );

    final data = await _handleResponse(response);
    return (data['orders'] as List)
        .map((order) => Order.fromJson(order))
        .toList();
  }

  Future<Order> createOrder() async {
    final response = await http.post(
      Uri.parse('${AppConstants.baseUrl}${AppConstants.ordersEndpoint}'),
      headers: _headers,
    );

    final data = await _handleResponse(response);
    return Order.fromJson(data['order']);
  }
}
