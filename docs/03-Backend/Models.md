---
tags: [reservia, backend, models, django, orm]
---

# Models

[[Home|← Volver al Home]]

**Archivo**: `backend/api/models.py` (123 líneas)

> Para el diagrama ER completo ver [[Database Schema]].

---

## Resumen de Modelos

| Modelo | Tabla DB | Descripción |
|--------|----------|-------------|
| `Restaurant` | `api_restaurant` | Restaurantes disponibles |
| `MenuItem` | `api_menuitem` | Platos del menú |
| `Reservation` | `api_reservation` | Reservas de usuarios |
| `FloorPlan` | `api_floorplan` | Configuración del plano de piso |
| `Table` | `api_table` | Mesas dentro de un plano |
| `Seat` | `api_seat` | Asientos dentro de una mesa |
| `SeatReservation` | `api_seatreservation` | Relación asiento-reserva |

---

## 🍽️ Restaurant

```python
class Restaurant(models.Model):
    name         = models.CharField(max_length=200)
    cuisine      = models.CharField(max_length=100)
    location     = models.CharField(max_length=200)
    distance     = models.FloatField(default=0)
    rating       = models.FloatField(default=0)
    price_range  = models.CharField(max_length=10)
    address      = models.CharField(max_length=300)
    description  = models.TextField(default='')
    lat          = models.FloatField(default=0)
    lng          = models.FloatField(default=0)
    image_url    = models.URLField(max_length=500, default='')
    reviews_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-rating']
```

---

## 🥗 MenuItem

```python
class MenuItem(models.Model):
    restaurant  = models.ForeignKey(Restaurant, on_delete=models.CASCADE,
                                    related_name='menu_items')
    name        = models.CharField(max_length=200)
    description = models.TextField(default='')
    price       = models.FloatField()
```

---

## 📅 Reservation

```python
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    date       = models.DateField()
    time       = models.TimeField()
    guests     = models.IntegerField()
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                   default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']
```

> [!warning] Validación de `guests`
> La validación de 1-20 comensales se hace en `ReservationSerializer`, no en el modelo.

---

## 🏢 FloorPlan

```python
class FloorPlan(models.Model):
    restaurant       = models.OneToOneField(Restaurant, on_delete=models.CASCADE,
                                             related_name='floor_plan')
    width            = models.IntegerField(default=1000)
    height           = models.IntegerField(default=700)
    background_color = models.CharField(max_length=20, default='#F8F9FA')
    updated_at       = models.DateTimeField(auto_now=True)
```

---

## 🪑 Table

```python
class Table(models.Model):
    SHAPE_CHOICES = [
        ('round', 'Round'),
        ('square', 'Square'),
        ('rectangular', 'Rectangular'),
    ]
    floor_plan   = models.ForeignKey(FloorPlan, on_delete=models.CASCADE,
                                      related_name='tables')
    label        = models.CharField(max_length=50)
    shape        = models.CharField(max_length=20, choices=SHAPE_CHOICES)
    x            = models.FloatField()
    y            = models.FloatField()
    width        = models.FloatField()
    height       = models.FloatField()
    rotation     = models.FloatField(default=0)
    capacity     = models.IntegerField()
    min_capacity = models.IntegerField(default=1)

    class Meta:
        ordering = ['label']
```

---

## 💺 Seat

```python
class Seat(models.Model):
    table      = models.ForeignKey(Table, on_delete=models.CASCADE,
                                    related_name='seats')
    seat_index = models.IntegerField()
    label      = models.CharField(max_length=50)  # e.g., "T1-A"

    class Meta:
        unique_together = ['table', 'seat_index']
        ordering = ['seat_index']
```

**Generación de etiquetas**:
```python
# En seed.py - genera automáticamente: T1-A, T1-B, T1-C...
letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
label = f"{table.label}-{letters[i]}"
```

---

## 🔗 SeatReservation

```python
class SeatReservation(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    seat        = models.ForeignKey(Seat, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['reservation', 'seat']
```

---

## 📊 Serializers Relacionados

**Archivo**: `backend/api/serializers.py` (176 líneas)

| Serializer | Modelo | Uso |
|-----------|--------|-----|
| `RestaurantListSerializer` | Restaurant | Lista de restaurantes |
| `RestaurantDetailSerializer` | Restaurant | Detalle con menú |
| `MenuItemSerializer` | MenuItem | Items del menú |
| `ReservationSerializer` | Reservation | CRUD de reservas |
| `FloorPlanSerializer` | FloorPlan | Plano completo |
| `TableSerializer` | Table | Mesa con asientos |
| `SeatSerializer` | Seat | Asiento individual |
| `SeatAvailabilitySerializer` | Seat | Disponibilidad de asiento |

---

## 🔗 Links Relacionados

- [[Database Schema]] — Diagrama ER visual
- [[API Endpoints]] — Cómo se exponen estos modelos
- [[Database Seeding]] — Cómo se pobla la base de datos
