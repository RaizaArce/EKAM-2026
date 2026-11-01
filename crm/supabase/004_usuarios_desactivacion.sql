-- ============================================
-- CRM EKAM - Fecha de desactivación de usuarios (RF08)
-- Ejecutar después de 003_usuarios.sql.
-- Permite mostrar "Sin acceso desde 30/09" en la pantalla de Usuarios.
-- ============================================

alter table public.perfiles add column desactivado_en timestamptz;

-- La fecha se guarda sola cuando cambia "activo", sin importar desde dónde se cambie.
create function public.perfiles_fecha_desactivacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.activo is distinct from old.activo then
        new.desactivado_en := case when new.activo then null else now() end;
    end if;
    return new;
end;
$$;

create trigger perfiles_registrar_desactivacion
    before update on public.perfiles
    for each row execute function public.perfiles_fecha_desactivacion();

-- listar_usuarios ahora también entrega esa fecha.
drop function public.listar_usuarios();

create function public.listar_usuarios()
returns table (
    id             uuid,
    nombre         text,
    correo         text,
    rol            public.rol_usuario,
    activo         boolean,
    creado_en      timestamptz,
    ultimo_ingreso timestamptz,
    desactivado_en timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if not public.es_admin() then
        raise exception 'Solo el administrador puede ver la lista de usuarios' using errcode = '42501';
    end if;
    return query
        select p.id, p.nombre, u.email::text, p.rol, p.activo, p.creado_en, u.last_sign_in_at, p.desactivado_en
        from public.perfiles p
        join auth.users u on u.id = p.id
        order by p.activo desc, p.nombre;
end;
$$;

revoke execute on function public.listar_usuarios() from public, anon;
grant execute on function public.listar_usuarios() to authenticated;
