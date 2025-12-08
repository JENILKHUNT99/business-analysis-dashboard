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


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_detail',
            'quantity', 'price_at_sale', 'total_price',
        ]
        read_only_fields = ['id', 'product_detail', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'order_date',
            'payment_method', 'items', 'total_amount',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']

    def create(self, validated_data):
        """
        Custom create to handle nested items + stock update.
        """
        from django.db import transaction
        items_data = validated_data.pop('items', [])

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']

                # Default price_at_sale to current sell_price if not provided
                price_at_sale = item_data.get('price_at_sale') or product.sell_price

                # Create order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price_at_sale=price_at_sale,
                )

                # Decrease stock
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
