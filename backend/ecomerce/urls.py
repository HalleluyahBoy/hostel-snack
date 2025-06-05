from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/login/', views.CustomAuthToken.as_view(), name='login'),
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    
    # Profile URLs
    path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Product URLs
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Cart URLs
    path('cart/', views.CartListView.as_view(), name='cart-list'),
    path('cart/add/', views.CartCreateView.as_view(), name='cart-add'),
    path('cart/<int:pk>/update/', views.CartUpdateView.as_view(), name='cart-update'),
    path('cart/<int:pk>/delete/', views.CartDeleteView.as_view(), name='cart-delete'),
    path('cart/clear/', views.clear_cart, name='cart-clear'),
    
    # Order URLs
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/create/', views.create_order, name='order-create'),
    
    # Review URLs
    path('products/<int:product_id>/reviews/', views.ReviewListView.as_view(), name='review-list'),
    path('reviews/create/', views.ReviewCreateView.as_view(), name='review-create'),
    
    # Wishlist URLs
    path('wishlist/', views.WishlistListView.as_view(), name='wishlist-list'),
    path('wishlist/add/', views.WishlistCreateView.as_view(), name='wishlist-add'),
    path('wishlist/<int:pk>/delete/', views.WishlistDeleteView.as_view(), name='wishlist-delete'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]
