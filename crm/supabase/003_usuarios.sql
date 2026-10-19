-- ============================================
-- CRM EKAM - Administración de usuarios (RF07, RF08, RNF02)
-- Ejecutar después de 001_esquema.sql y 002_registro_web.sql.
-- ============================================

-- Solo el administrador crea usuarios, desde el CRM: la función usuarios-admin
-- (con la clave de servicio) crea el usuario y enseguida activa su perfil con el rol
-- elegido. Todo perfil nace desactivado, así que si alguien logra registrarse por su
-- cuenta con la clave pública, no ve ningún dato.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.perfiles (id, nombre, activo)
    values (
        new.id,
        coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), new.email),
        false
    );
    return new;
end;
$$;

-- Lista de usuarios con su correo y último ingreso para la pantalla del administrador.
-- El correo está en auth.users, que el navegador no puede leer directamente.
create function public.listar_usuarios()
returns table (
    id             uuid,
    nombre         text,
    correo         text,
    rol            public.rol_usuario,
    activo         boolean,
    creado_en      timestamptz,
    ultimo_ingreso timestamptz
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
        select p.id, p.nombre, u.email::text, p.rol, p.activo, p.creado_en, u.last_sign_in_at
        from public.perfiles p
        join auth.users u on u.id = p.id
        order by p.activo desc, p.nombre;
end;
$$;

revoke execute on function public.listar_usuarios() from public, anon;
grant execute on function public.listar_usuarios() to authenticated;

-- ============================================
-- Además, en Authentication > Sign In / Providers debe estar apagado
-- "Allow new users to sign up": los usuarios solo los crea el administrador.
-- ============================================
