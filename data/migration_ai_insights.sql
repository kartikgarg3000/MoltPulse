
-- Add ai_summary column to agents table
do $$ 
begin
  if not exists (select 1 from pf_get_columns('agents') where column_name = 'ai_summary') then
    alter table agents add column ai_summary text;
  end if;
end $$;
