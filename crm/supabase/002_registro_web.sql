-- ============================================
-- CRM EKAM - Registro de interesados desde el formulario web (RF02, RNF04)
-- Ejecutar en el SQL Editor después de 001_esquema.sql.
--
-- La web usa la clave pública del proyecto, así que "anon" solo puede ejecutar
-- esta función: no lee ni modifica ninguna tabla directamente (RNF02, RNF03).
-- La función valida los datos y guarda el interesado junto con su consentimiento.
-- ============================================

create function public.registrar_interesado_web(
    p_nombre            text,
    p_empresa           text,
    p_telefono          text,
    p_correo            text,
    p_solucion          text,
    p_plazo             text,
    p_necesidad         text,
    p_origen_url        text,
    p_consentimiento    boolean,
    p_version_politica  text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_id       uuid;
    v_nombre   text := nullif(trim(p_nombre), '');
    v_telefono text := nullif(trim(p_telefono), '');
    v_correo   text := nullif(lower(trim(p_correo)), '');
begin
    -- Sin consentimiento no se registra nada (Ley N° 29733).
    if p_consentimiento is not true then
        raise exception 'Se requiere el consentimiento de tratamiento de datos' using errcode = '22023';
    end if;

    if v_nombre is null or length(v_nombre) > 120
       or length(coalesce(p_empresa, '')) > 150
       or length(coalesce(v_telefono, '')) > 30
       or length(coalesce(v_correo, '')) > 150
       or length(coalesce(p_plazo, '')) > 40
       or length(coalesce(p_necesidad, '')) > 1000
       or length(coalesce(p_origen_url, '')) > 300
       or nullif(trim(p_version_politica), '') is null
       or length(p_version_politica) > 20 then
        raise exception 'Datos incompletos o demasiado largos' using errcode = '22023';
    end if;

    if v_telefono is null and v_correo is null then
        raise exception 'Se necesita un teléfono o un correo' using errcode = '22023';
    end if;

    if v_correo is not null and v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
        raise exception 'Correo no válido' using errcode = '22023';
    end if;

    -- Si la misma persona reenvía el formulario en pocos minutos, no se duplica.
    if exists (
        select 1
        from public.interesados
        where medio_contacto = 'web_formulario'
          and creado_en > now() - interval '10 minutes'
          and (
                (v_telefono is not null
                 and telefono_normalizado = right(regexp_replace(v_telefono, '\D', '', 'g'), 9))
             or (v_correo is not null and lower(correo) = v_correo)
          )
    ) then
        return;
    end if;

    -- Freno ante envíos masivos: una empresa como EKAM no recibe 30 solicitudes por hora.
    if (
        select count(*)
        from public.interesados
        where medio_contacto = 'web_formulario'
          and creado_en > now() - interval '1 hour'
    ) >= 30 then
        raise exception 'Demasiadas solicitudes, intenta más tarde' using errcode = 'P0001';
    end if;

    insert into public.interesados (
        nombre, empresa, telefono, correo, solucion,
        medio_contacto, plazo, necesidad, origen_url
    )
    values (
        v_nombre,
        nullif(trim(p_empresa), ''),
        v_telefono,
        v_correo,
        -- Un código que no está en el catálogo se guarda vacío en vez de fallar.
        (select codigo from public.soluciones where codigo = p_solucion and activo),
        'web_formulario',
        nullif(trim(p_plazo), ''),
        nullif(trim(p_necesidad), ''),
        nullif(trim(p_origen_url), '')
    )
    returning id into v_id;

    insert into public.consentimientos (interesado_id, canal, version_politica)
    values (v_id, 'web_formulario', trim(p_version_politica));
end;
$$;

-- Supabase da permiso de ejecución a todos por defecto: se deja solo para "anon".
revoke execute on function public.registrar_interesado_web(
    text, text, text, text, text, text, text, text, boolean, text
) from public, authenticated;

grant execute on function public.registrar_interesado_web(
    text, text, text, text, text, text, text, text, boolean, text
) to anon;

-- ============================================
-- Prueba rápida (desde el SQL Editor):
--   select public.registrar_interesado_web(
--       'Prueba', 'Empresa SAC', '999 999 999', null, 'contabilidad',
--       'este-mes', 'Prueba de conexión', 'https://www.ekamperu.com/', true, '2026-10-16');
--   select nombre, medio_contacto, etapa, creado_en from public.interesados order by creado_en desc limit 5;
--   select * from public.consentimientos order by aceptado_en desc limit 5;
-- Luego borrar los registros de prueba.
-- ============================================
