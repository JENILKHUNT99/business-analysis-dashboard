from rest_framework import viewsets
from rest_framework.permissions import AllowAny  # later you can change to IsAuthenticated

from .models import Product, Customer, Order, Expense
from .serializers import (
    ProductSerializer,
    CustomerSerializer,
    OrderSerializer,
    ExpenseSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Products.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Customers.
    """
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]


class OrderViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Orders, including nested items.
    """
    queryset = Order.objects.all().order_by('-order_date')
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Expenses.
    """
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]
