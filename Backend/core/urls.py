from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    CustomerViewSet,
    OrderViewSet,
    ExpenseViewSet,
    SalesSummaryView,
    MonthlySalesView,
    TopProductsView,
    ExpensesSummaryView,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    # CRUD routes: /api/products/, /api/customers/, etc.
    path('', include(router.urls)),

    # Analytics routes
    path('analytics/sales-summary/', SalesSummaryView.as_view(), name='sales-summary'),
    path('analytics/monthly-sales/', MonthlySalesView.as_view(), name='monthly-sales'),
    path('analytics/top-products/', TopProductsView.as_view(), name='top-products'),
    path('analytics/expenses-summary/', ExpensesSummaryView.as_view(), name='expenses-summary'),
]
