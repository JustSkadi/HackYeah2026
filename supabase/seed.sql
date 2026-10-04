-- Minimalny seed. Pełny stan demo (lekarze, wizyta) ustawia przycisk "Resetuj demo" w /demo.
insert into seniors (id, name, birth_date, sex, caregiver_name, caregiver_phone)
values ('00000000-0000-4000-8000-000000000001', 'Halina Kowalska', '1948-03-12', 'F', 'Anna (córka)', '+48500000009')
on conflict (id) do nothing;

insert into demo_state (id, time_offset_minutes) values (1, 0)
on conflict (id) do nothing;
