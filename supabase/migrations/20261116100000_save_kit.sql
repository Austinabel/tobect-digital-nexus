-- Atomic save for the admin kit editor: the kit row and its component
-- positions, product choices, accessories and extras are written in one
-- transaction, so a shopper never sees a half-saved kit.
-- Server-only (called with the secret key after the app checks the staff
-- member's permission); not callable from browsers.
-- Additive. Down: 20261116100000_save_kit.down.sql

create or replace function public.save_kit(p_existing text, p_kit jsonb, p_slots jsonb, p_accessories jsonb, p_addons jsonb, p_actor uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_slug text := coalesce(p_existing, p_kit->>'slug');
  s jsonb;
  c text;
  i int;
begin
  if p_existing is null then
    insert into solar_kits (slug, name, capacity_label, tag, summary, applications, outline, image_url, image_alt, image_position,
                            purchasable, accessories_price_ngn, installation_note, published, sort_order, updated_by, is_sample)
    values (v_slug, p_kit->>'name', p_kit->>'capacity_label', p_kit->>'tag', p_kit->>'summary',
            array(select jsonb_array_elements_text(p_kit->'applications')), array(select jsonb_array_elements_text(p_kit->'outline')),
            p_kit->>'image_url', p_kit->>'image_alt', p_kit->>'image_position',
            (p_kit->>'purchasable')::boolean, (p_kit->>'accessories_price_ngn')::bigint, p_kit->>'installation_note',
            (p_kit->>'published')::boolean, (p_kit->>'sort_order')::int, p_actor, false);
  else
    update solar_kits set
      name = p_kit->>'name', capacity_label = p_kit->>'capacity_label', tag = p_kit->>'tag', summary = p_kit->>'summary',
      applications = array(select jsonb_array_elements_text(p_kit->'applications')),
      outline = array(select jsonb_array_elements_text(p_kit->'outline')),
      image_url = p_kit->>'image_url', image_alt = p_kit->>'image_alt', image_position = p_kit->>'image_position',
      purchasable = (p_kit->>'purchasable')::boolean, accessories_price_ngn = (p_kit->>'accessories_price_ngn')::bigint,
      installation_note = p_kit->>'installation_note', published = (p_kit->>'published')::boolean,
      sort_order = (p_kit->>'sort_order')::int, updated_at = now(), updated_by = p_actor
    where slug = v_slug;
    if not found then raise exception 'kit_not_found' using errcode = 'P0002'; end if;
  end if;

  delete from kit_slots where kit_slug = v_slug;           -- choices cascade
  for s in select * from jsonb_array_elements(p_slots) loop
    insert into kit_slots (kit_slug, key, label, role, qty_default, qty_min, qty_max, sort_order)
    values (v_slug, s->>'key', s->>'label', s->>'role', (s->>'qty_default')::int, (s->>'qty_min')::int, (s->>'qty_max')::int, (s->>'sort_order')::int);
    i := 0;
    for c in select jsonb_array_elements_text(s->'choices') loop
      insert into kit_slot_choices (kit_slug, slot_key, product_slug, sort_order) values (v_slug, s->>'key', c, i);
      i := i + 1;
    end loop;
  end loop;
  -- compatibility rules that point at a position that no longer exists can never apply
  delete from kit_rules where kit_slug = v_slug
    and (when_slot not in (select key from kit_slots where kit_slug = v_slug) or require_slot not in (select key from kit_slots where kit_slug = v_slug));

  delete from kit_accessories where kit_slug = v_slug;
  insert into kit_accessories (kit_slug, name, detail, sort_order)
  select v_slug, a->>'name', a->>'detail', (a->>'sort_order')::int from jsonb_array_elements(p_accessories) a;

  delete from kit_addons where kit_slug = v_slug;
  insert into kit_addons (kit_slug, key, label, description, price_ngn)
  select v_slug, a->>'key', a->>'label', a->>'description', (a->>'price_ngn')::bigint from jsonb_array_elements(p_addons) a;

  return v_slug;
end;
$$;
revoke execute on function public.save_kit(text, jsonb, jsonb, jsonb, jsonb, uuid) from public, anon, authenticated;
