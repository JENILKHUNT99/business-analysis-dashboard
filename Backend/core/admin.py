from django.contrib import admin
from .models import Product, Customer, Order, OrderItem, Expense


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'stock', 'is_low_stock')
    list_filter = ('category',)
    search_fields = ('name', 'sku')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'city', 'created_at')
    search_fields = ('name', 'phone', 'email')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'order_date', 'payment_method', 'total_amount')
    list_filter = ('payment_method', 'order_date')
    inlines = [OrderItemInline]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'date', 'created_at')
    list_filter = ('category', 'date')
