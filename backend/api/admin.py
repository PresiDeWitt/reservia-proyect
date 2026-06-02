from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth.models import User

from .models import (
    Restaurant,
    MenuItem,
    RestaurantTable,
    AvailabilitySlot,
    Reservation,
    Review,
    Notification,
    UserProfile,
    StaffCode,
    Favorite,
)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0


class UserAdmin(DefaultUserAdmin):
    inlines = (UserProfileInline,)
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "is_staff",
        "date_joined",
    )
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "cuisine",
        "location",
        "rating",
        "reviews_count",
        "price_range",
        "owner",
    )
    list_filter = ("cuisine", "location", "price_range")
    search_fields = ("name", "address", "location", "cuisine")
    autocomplete_fields = ("owner",)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "price")
    list_filter = ("restaurant",)
    search_fields = ("name", "restaurant__name")
    autocomplete_fields = ("restaurant",)


@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "restaurant",
        "zone",
        "capacity",
        "supplement",
        "is_active",
    )
    list_filter = ("zone", "is_active", "restaurant")
    search_fields = ("label", "restaurant__name")
    autocomplete_fields = ("restaurant",)
    list_editable = ("is_active",)


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("table", "date", "time", "is_available")
    list_filter = ("is_available", "date", "table__restaurant")
    search_fields = ("table__label", "table__restaurant__name")
    date_hierarchy = "date"
    list_editable = ("is_available",)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        "__str__",
        "restaurant",
        "date",
        "time",
        "guests",
        "status",
        "assigned_table",
        "created_at",
    )
    list_filter = ("status", "occasion", "date", "restaurant")
    search_fields = ("user__email", "user__username", "restaurant__name")
    readonly_fields = ("note", "created_at")
    date_hierarchy = "date"
    autocomplete_fields = ("user", "restaurant", "assigned_table")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("__str__", "restaurant", "rating", "created_at")
    list_filter = ("rating", "created_at", "restaurant")
    search_fields = ("user__email", "comment", "restaurant__name")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "title", "is_read", "created_at")
    list_filter = ("type", "is_read", "created_at")
    search_fields = ("user__email", "title", "message")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


@admin.register(StaffCode)
class StaffCodeAdmin(admin.ModelAdmin):
    list_display = (
        "role",
        "code_preview",
        "email",
        "restaurant",
        "is_active",
        "created_at",
    )
    list_filter = ("role", "is_active")
    search_fields = ("email", "restaurant__name")
    readonly_fields = ("code", "created_at")
    list_editable = ("is_active",)
    autocomplete_fields = ("restaurant",)

    @admin.display(description="Code (hash)")
    def code_preview(self, obj):
        return f"{obj.code[:12]}…" if obj.code else ""


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "restaurant", "created_at")
    search_fields = ("user__email", "restaurant__name")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
