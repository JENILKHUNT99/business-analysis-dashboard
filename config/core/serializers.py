from django.db import transaction
from rest_framework import serializers
from .models import Product, Customer, Order, OrderItem, Expense


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'sku',
            'buy_price', 'sell_price', 'stock',
            'low_stock_threshold', 'is_low_stock',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_low_stock', 'created_at', 'updated_at']


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email', 'city',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================
# ORDER READ SERIALIZERS
# ============================

class OrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_category = serializers.CharField(source='product.category', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',          # product id
            'product_name',
            'product_sku',
            'product_category',
            'quantity',
            'price_at_sale',
            'total_price',
        ]
        read_only_fields = fields

    def get_total_price(self, obj):
        return obj.total_price


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name',
            'order_date', 'payment_method',
            'items', 'total_amount',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']

    def get_total_amount(self, obj):
        return obj.total_amount


# ============================
# ORDER WRITE SERIALIZERS
# ============================

class OrderItemWriteSerializer(serializers.Serializer):
    """
    Used for creating/updating orders with nested items.
    Example:
    {
      "product": 1,
      "quantity": 2,
      "price_at_sale": "700.00"  (optional)
    }
    """
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    price_at_sale = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )


class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer',
            'order_date', 'payment_method',
            'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                price_at_sale = item_data.get('price_at_sale') or product.sell_price

                # Create order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_at_sale=price_at_sale,
                )

                # Update product stock
                product.stock = product.stock - quantity
                product.save()

        return order


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'amount', 'date',
            'note', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
