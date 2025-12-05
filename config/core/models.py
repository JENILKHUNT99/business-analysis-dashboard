from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        
class product(models.Model):
    name=models.CharField(max_lengeth=200)
    category=models.CharField(max_length=100,blank=True)
    sku=models.CharField(max_length=50,unique=True)
    buy_price=models.DecimalField(max_digits=10,decimal_places=2)
    sell_price=models.DecimalField(max_digits=10,decimal_places=2)
    stock=models.PositiveIntegerField(default=0)
    low_stock_threshold=models.PositiveIntegerField(default=10)
    
    def __str__(self):
        return f"{self.name} ({self.sku})"    