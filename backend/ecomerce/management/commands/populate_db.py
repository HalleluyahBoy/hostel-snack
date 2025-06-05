from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ecomerce.models import Category, Product, Profile
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create categories
        categories_data = [
            {
                'name': 'Snacks',
                'description': 'Delicious snacks and treats',
                'image': 'https://images.unsplash.com/photo-1575474041544-51f1d6f2ad18?w=400'
            },
            {
                'name': 'Beverages',
                'description': 'Refreshing drinks and beverages',
                'image': 'https://images.unsplash.com/photo-1574943320222-0f4a7eab2160?w=400'
            },
            {
                'name': 'Sweets',
                'description': 'Sweet treats and candies',
                'image': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400'
            },
            {
                'name': 'Healthy',
                'description': 'Nutritious and healthy options',
                'image': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400'
            }
        ]

        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'image': cat_data['image']
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create products
        products_data = [
            # Snacks
            {
                'name': 'Classic Potato Chips',
                'description': 'Crispy and salty potato chips made from premium potatoes.',
                'price': Decimal('2.99'),
                'stock': 50,
                'category': categories[0],
                'image': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'
            },
            {
                'name': 'Cheese Crackers',
                'description': 'Crunchy crackers with real cheese flavor.',
                'price': Decimal('3.49'),
                'stock': 30,
                'category': categories[0],
                'image': 'https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=400'
            },
            {
                'name': 'Mixed Nuts',
                'description': 'Premium mix of roasted almonds, cashews, and peanuts.',
                'price': Decimal('5.99'),
                'stock': 25,
                'category': categories[0],
                'image': 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400'
            },
            
            # Beverages
            {
                'name': 'Orange Juice',
                'description': 'Fresh squeezed orange juice, 100% natural.',
                'price': Decimal('4.99'),
                'stock': 20,
                'category': categories[1],
                'image': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
            },
            {
                'name': 'Cola Drink',
                'description': 'Classic cola soft drink with a refreshing taste.',
                'price': Decimal('1.99'),
                'stock': 40,
                'category': categories[1],
                'image': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400'
            },
            {
                'name': 'Green Tea',
                'description': 'Premium green tea with antioxidants.',
                'price': Decimal('3.99'),
                'stock': 15,
                'category': categories[1],
                'image': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'
            },
            
            # Sweets
            {
                'name': 'Chocolate Bar',
                'description': 'Rich dark chocolate bar with 70% cocoa.',
                'price': Decimal('2.49'),
                'stock': 35,
                'category': categories[2],
                'image': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400'
            },
            {
                'name': 'Gummy Bears',
                'description': 'Colorful and chewy gummy bears in assorted flavors.',
                'price': Decimal('1.99'),
                'stock': 45,
                'category': categories[2],
                'image': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400'
            },
            
            # Healthy
            {
                'name': 'Granola Bar',
                'description': 'Healthy granola bar with oats, nuts, and dried fruits.',
                'price': Decimal('2.29'),
                'stock': 30,
                'category': categories[3],
                'image': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400'
            },
            {
                'name': 'Protein Shake',
                'description': 'High protein shake for post-workout nutrition.',
                'price': Decimal('6.99'),
                'stock': 20,
                'category': categories[3],
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
            }
        ]

        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')

        # Create a test user
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            
            # Create profile for test user
            Profile.objects.create(
                user=test_user,
                address='123 Test Street',
                phone_number='+1234567890',
                city='Test City',
                country='Test Country',
                postal_code='12345'
            )
            self.stdout.write(f'Created test user: {test_user.username}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data!')
        )
