class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000/api'; // iOS simulator
  // static const String baseUrl = 'http://YOUR_IP:3000/api'; // Physical device

  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/auth/profile';
  static const String productsEndpoint = '/products';
  static const String cartEndpoint = '/cart';
  static const String ordersEndpoint = '/orders';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  // App Colors
  static const int primaryColor = 0xFF2196F3;
  static const int accentColor = 0xFF03DAC6;
  static const int errorColor = 0xFFB00020;

  // App Strings
  static const String appName = 'Deals On';
  static const String loginTitle = 'Welcome Back';
  static const String registerTitle = 'Create Account';
}
