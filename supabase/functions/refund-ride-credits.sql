create or replace function refund_ride_credits(user_id uuid, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set credits = credits + amount
  where id = user_id;
end;
$$;