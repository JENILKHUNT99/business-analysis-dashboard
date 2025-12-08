from datetime import date, timedelta

from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Product, Customer, Order, Expense
from .serializers import (
    ProductSerializer,
    CustomerSerializer,
    OrderReadSerializer,
    OrderWriteSerializer,
    ExpenseSerializer,
)

# ============================
# CRUD VIEWSETS
# ============================

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
    CRUD API for Orders, with different serializers for read/write.
    """
    queryset = Order.objects.all().order_by('-order_date')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OrderWriteSerializer
        return OrderReadSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Expenses.
    """
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]


# ============================
# ANALYTICS APIS
# ============================

class SalesSummaryView(APIView):
    """
    High-level metrics for dashboard:
    - today_sales
    - month_sales
    - total_revenue
    - total_expense
    - total_profit
    - total_orders
    - total_customers
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        today = date.today()
        start_of_month = today.replace(day=1)

        orders = Order.objects.all().prefetch_related('items__product')

        total_revenue = 0
        today_sales = 0
        month_sales = 0

        for order in orders:
            order_total = order.total_amount or 0

            total_revenue += order_total

            if order.order_date.date() == today:
                today_sales += order_total

            if order.order_date.date() >= start_of_month:
                month_sales += order_total

        total_expense = (
            Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
        )
        total_profit = total_revenue - total_expense

        data = {
            "today_sales": today_sales,
            "month_sales": month_sales,
            "total_revenue": total_revenue,
            "total_expense": total_expense,
            "total_profit": total_profit,
            "total_orders": orders.count(),
            "total_customers": Customer.objects.count(),
        }
        return Response(data)


class MonthlySalesView(APIView):
    """
    Sales grouped by month for last 12 months.
    Response example:
    [
      {"month": "2025-01", "total_sales": 12345.50},
      {"month": "2025-02", "total_sales": 9876.00}
    ]
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        today = date.today()
        one_year_ago = today.replace(year=today.year - 1)

        orders = Order.objects.filter(order_date__date__gte=one_year_ago)

        monthly_totals = {}  # {"YYYY-MM": Decimal}

        for order in orders:
            key = order.order_date.strftime("%Y-%m")
            monthly_totals.setdefault(key, 0)
            monthly_totals[key] += order.total_amount or 0

        result = [
            {"month": month, "total_sales": total}
            for month, total in sorted(monthly_totals.items())
        ]
        return Response(result)


class TopProductsView(APIView):
    """
    Top N products by quantity sold.
    Query param: ?limit=5 (default 5)
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        top_n = int(request.query_params.get("limit", 5))

        products = (
            Product.objects
            .annotate(total_quantity=Sum('order_items__quantity'))
            .filter(total_quantity__isnull=False)
            .order_by('-total_quantity')[:top_n]
        )

        data = [
            {
                "product_id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category,
                "total_quantity": p.total_quantity,
            }
            for p in products
        ]
        return Response(data)


class ExpensesSummaryView(APIView):
    """
    Expenses grouped by category.
    Optional filters:
      ?start=YYYY-MM-DD
      ?end=YYYY-MM-DD
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        start_str = request.query_params.get("start")
        end_str = request.query_params.get("end")

        qs = Expense.objects.all()

        if start_str:
            qs = qs.filter(date__gte=start_str)
        if end_str:
            qs = qs.filter(date__lte=end_str)

        grouped = (
            qs.values("category")
            .annotate(total_amount=Sum("amount"))
            .order_by("-total_amount")
        )

        return Response(list(grouped))
