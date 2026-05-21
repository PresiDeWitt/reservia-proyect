from datetime import date, timedelta, time

from django.core.management.base import BaseCommand

from api.models import RestaurantTable, AvailabilitySlot

SERVICE_HOURS = [
    time(13, 0), time(13, 30), time(14, 0), time(14, 30), time(15, 0),
    time(20, 0), time(20, 30), time(21, 0), time(21, 30), time(22, 0), time(22, 30),
]


class Command(BaseCommand):
    help = 'Generate AvailabilitySlots for all active tables for the next N days'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30)

    def handle(self, *args, **options):
        days = options['days']
        tables = list(RestaurantTable.objects.filter(is_active=True))
        if not tables:
            self.stdout.write('No active tables found.')
            return

        today = date.today()
        created = 0
        for delta in range(days):
            slot_date = today + timedelta(days=delta)
            for table in tables:
                for t in SERVICE_HOURS:
                    _, was_created = AvailabilitySlot.objects.get_or_create(
                        table=table, date=slot_date, time=t,
                        defaults={'is_available': True},
                    )
                    if was_created:
                        created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} new slots for {days} days.'))
